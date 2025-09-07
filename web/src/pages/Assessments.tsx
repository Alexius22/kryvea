import { mdiContentDuplicate, mdiDownload, mdiFileEdit, mdiPlus, mdiStar, mdiTabSearch, mdiTrashCan } from "@mdi/js";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { deleteData, getData, patchData, postData } from "../api/api";
import { GlobalContext } from "../App";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import PageHeader from "../components/Composition/PageHeader";
import Table from "../components/Composition/Table";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import DateCalendar from "../components/Form/DateCalendar";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import { SelectOption } from "../components/Form/SelectWrapper.types";
import { Assessment, exportTypes, Template } from "../types/common.types";
import { formatDate } from "../utils/dates";
import { getPageTitle } from "../utils/helpers";

export default function Assessments() {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();

  const [isModalDownloadActive, setIsModalDownloadActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);
  const [isModalCloneActive, setIsModalCloneActive] = useState(false);

  const [assessmentToClone, setAssessmentToClone] = useState<Assessment | null>(null);
  const [assessmentToDelete, setAssessmentToDelete] = useState<Assessment | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  const [cloneName, setCloneName] = useState("");

  const [selectedExportTypeOption, setSelectedExportTypeOption] = useState<SelectOption>(exportTypes[0]);
  const [templatesByTypeAndLanguage, setTemplatesByTypeAndLanguage] = useState<Template[]>([]);
  const [templateOptions, setTemplateOptions] = useState<SelectOption[]>([]);
  const [selectedExportTemplate, setSelectedExportTemplate] = useState<Template | null>(null);
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);

  const [exportEncryption, setExportEncryption] = useState<SelectOption>({ value: "none", label: "None" });
  const [exportPassword, setExportPassword] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString());

  const [statusSelectOptions] = useState<SelectOption[]>([
    { label: "On Hold", value: "On Hold" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
  ]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(true);

  const {
    useCtxAssessment: [, setCtxAssessment],
  } = useContext(GlobalContext);

  const fetchAssessments = () => {
    setLoadingAssessments(true);
    getData<Assessment[]>(`/api/customers/${customerId}/assessments`, setAssessments, undefined, () =>
      setLoadingAssessments(false)
    );
  };

  useEffect(() => {
    document.title = getPageTitle("Assessments");
    fetchAssessments();
    getData<Template[]>("/api/templates", setAllTemplates);
  }, []);

  const getTemplatesByTypeAndLanguage = () =>
    allTemplates.filter(
      t => t.language === assessments[0]?.customer.language && t.mime_type === selectedExportTypeOption.value
    );

  useEffect(() => {
    const filteredTemplates = getTemplatesByTypeAndLanguage();

    setTemplatesByTypeAndLanguage(filteredTemplates);
    setTemplateOptions(
      filteredTemplates.map(t => ({
        value: t.id,
        label: t.type ? `${t.name} (${t.type})` : t.name,
      }))
    );

    setSelectedExportTemplate(null);
    if (filteredTemplates.length > 0 && !selectedExportTemplate) {
      setSelectedExportTemplate(filteredTemplates[0]);
    }
  }, [allTemplates, selectedExportTypeOption]);

  const handleOwnedToggle = assessment => () => {
    patchData(
      `/api/users/me/assessments`,
      { assessment: assessment.id, is_owned: !assessment.is_owned },
      fetchAssessments
    );
  };

  const openCloneModal = (assessment: Assessment) => {
    setAssessmentToClone(assessment);
    setCloneName(`${assessment.name} (Copy)`);
    setIsModalCloneActive(true);
  };

  const confirmClone = () => {
    postData<Assessment>(`/api/assessments/${assessmentToClone.id}/clone`, { name: cloneName }, clonedAssessment => {
      setAssessments(prev => [...prev, clonedAssessment]);
      setIsModalCloneActive(false);
      setAssessmentToClone(null);
      setCloneName("");
      toast.success("Assessment cloned successfully");
    });
  };

  const openDeleteModal = (assessment: Assessment) => {
    setAssessmentToDelete(assessment);
    setIsModalTrashActive(true);
  };

  const confirmDelete = () => {
    deleteData(`/api/assessments/${assessmentToDelete.id}`, () => {
      setAssessments(prev => prev.filter(a => a.id !== assessmentToDelete.id));
      setIsModalTrashActive(false);
      setAssessmentToDelete(null);
      toast.success("Assessment deleted successfully");
    });
  };

  const handleStatusChange = (assessmentId: string, selectedOption: SelectOption) => {
    patchData<Assessment>(`/api/assessments/${assessmentId}`, { status: selectedOption.value }, updatedAssessment => {
      setAssessments(prev => prev.map(a => (a.id === assessmentId ? { ...a, status: selectedOption.value } : a)));
    });
  };

  const openExportModal = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    setIsModalDownloadActive(true);
  };

  const exportAssessment = () => {
    const payload = {
      type: selectedExportTypeOption.value,
      template: selectedExportTemplate.id,
      password: exportEncryption.value === "password" ? exportPassword : undefined,
      delivery_date_time: deliveryDate,
    };

    const toastDownload = toast.loading("Generating report...");
    postData<Blob>(
      `/api/assessments/${selectedAssessmentId}/export`,
      payload,
      data => {
        const url = window.URL.createObjectURL(data);
        const assessment = assessments.find(a => a.id === selectedAssessmentId);
        const extension =
          selectedExportTypeOption.value === "word"
            ? "docx"
            : selectedExportTypeOption.value === "excel"
              ? "xlsx"
              : "zip";
        const fileName = `${assessment?.name ?? "assessment"}_export.${extension}`;

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setIsModalDownloadActive(false);

        toast.update(toastDownload, {
          render: "Report generated successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
      },
      err => {
        toast.update(toastDownload, {
          render: err.response.data.error,
          type: "error",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
      }
    );
  };

  return (
    <div>
      {/* Clone Modal */}
      <Modal
        title="Clone assessment"
        confirmButtonLabel="Confirm"
        isActive={isModalCloneActive}
        onConfirm={confirmClone}
        onCancel={() => setIsModalCloneActive(false)}
      >
        <Input
          type="text"
          label="Assessment Name"
          placeholder="Cloned assessment name"
          id="assessment_name"
          value={cloneName}
          onChange={e => setCloneName(e.target.value)}
        />
      </Modal>

      {/* Download Modal */}
      <Modal
        title="Download report"
        confirmButtonLabel="Confirm"
        isActive={isModalDownloadActive}
        onConfirm={exportAssessment}
        onCancel={() => setIsModalDownloadActive(false)}
      >
        <Grid className="grid-cols-2">
          <SelectWrapper
            label="Type"
            id="type"
            options={exportTypes}
            value={selectedExportTypeOption}
            onChange={setSelectedExportTypeOption}
          />
          <SelectWrapper
            label="Template Type"
            id="template"
            options={templateOptions}
            value={
              selectedExportTemplate
                ? {
                    value: selectedExportTemplate.id,
                    label: selectedExportTemplate.type
                      ? `${selectedExportTemplate.name} (${selectedExportTemplate.type})`
                      : selectedExportTemplate.name,
                  }
                : null
            }
            onChange={option => {
              const selected = allTemplates.find(t => t.id === option.value) || null;
              setSelectedExportTemplate(selected);
            }}
          />

          <SelectWrapper
            label="Encryption"
            id="encryption"
            options={[
              { value: "none", label: "None" },
              { value: "password", label: "Password" },
            ]}
            value={exportEncryption}
            onChange={option => setExportEncryption(option)}
          />
          <Input
            type="password"
            id="password"
            className={exportEncryption.value !== "password" && "opacity-50"}
            disabled={exportEncryption.value !== "password"}
            placeholder="Insert password"
            value={exportPassword}
            onChange={e => setExportPassword(e.target.value)}
          />

          <DateCalendar
            idStart="delivery_date"
            label="Report delivery date"
            value={{ start: deliveryDate }}
            onChange={val => {
              if (typeof val === "string") {
                setDeliveryDate(val);
              }
            }}
          />
        </Grid>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Please confirm: action irreversible"
        confirmButtonLabel="Confirm"
        isActive={isModalTrashActive}
        onConfirm={confirmDelete}
        onCancel={() => setIsModalTrashActive(false)}
      >
        <p>Are you sure to delete this assessment?</p>
      </Modal>

      <PageHeader icon={mdiTabSearch} title="Assessments">
        <Button
          icon={mdiPlus}
          text="New assessment"
          small
          onClick={() => navigate(`/customers/${customerId}/assessments/new`)}
        />
      </PageHeader>

      <Table
        loading={loadingAssessments}
        data={assessments?.map(assessment => ({
          Title: (
            <Link
              to={`/customers/${customerId}/assessments/${assessment.id}/vulnerabilities`}
              onClick={() => setCtxAssessment(assessment)}
              title={assessment.name}
            >
              {assessment.name}
            </Link>
          ),
          Type: assessment.type.short,
          "CVSS Versions": [
            assessment.cvss_versions["3.1"] ? "3.1" : null,
            assessment.cvss_versions["4.0"] ? "4.0" : null,
          ]
            .filter(Boolean)
            .join(" | "),
          "Vuln count": assessment.vulnerability_count,
          Start: formatDate(assessment.start_date_time),
          End: formatDate(assessment.end_date_time),
          Status: (
            <SelectWrapper
              small
              widthFixed
              options={statusSelectOptions}
              value={statusSelectOptions.find(opt => opt.value === assessment.status)}
              onChange={selectedOption => handleStatusChange(assessment.id, selectedOption)}
            />
          ),
          buttons: (
            <Buttons noWrap>
              <Button
                variant={assessment.is_owned ? "warning" : ""}
                icon={mdiStar}
                onClick={handleOwnedToggle(assessment)}
                small
                title="Take ownership"
              />
              <Button
                icon={mdiFileEdit}
                onClick={() => navigate(`/customers/${customerId}/assessments/${assessment.id}`)}
                small
                title="Edit assessment"
              />
              <Button
                icon={mdiContentDuplicate}
                onClick={() => openCloneModal(assessment)}
                small
                title="Clone assessment"
              />
              <Button
                icon={mdiDownload}
                onClick={() => openExportModal(assessment.id)}
                small
                title="Download assessment"
              />
              <Button variant="danger" icon={mdiTrashCan} onClick={() => openDeleteModal(assessment)} small />
            </Buttons>
          ),
        }))}
        perPageCustom={50}
        maxWidthColumns={{ Title: "24rem" }}
      />
    </div>
  );
}
