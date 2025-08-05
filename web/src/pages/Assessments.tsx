import { mdiContentDuplicate, mdiDownload, mdiFileEdit, mdiPlus, mdiStar, mdiTabSearch, mdiTrashCan } from "@mdi/js";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { deleteData, getData, patchData, postData } from "../api/api";
import { GlobalContext } from "../App";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import Table from "../components/Composition/Table";
import { formatDate } from "../components/dateUtils";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import { SelectOption } from "../components/Form/SelectWrapper.types";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import { getPageTitle } from "../config";
import { Assessment, Customer, exportTypes, Template } from "../types/common.types";

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

  const [exportType, setExportType] = useState<SelectOption>(exportTypes[0]);
  const [exportTemplateOptions, setExportTemplateOptions] = useState<Template[]>([]);
  const [selectedExportTemplate, setSelectedExportTemplate] = useState<Template | null>(null);
  const allTemplatesRef = useRef<Template[]>([]);

  const [exportEncryption, setExportEncryption] = useState<SelectOption>({ value: "none", label: "None" });
  const [exportPassword, setExportPassword] = useState("");

  const [statusSelectOptions] = useState<SelectOption[]>([
    { label: "On Hold", value: "On Hold" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
  ]);
  const [assessmentsData, setAssessmentsData] = useState<Assessment[]>([]);

  const {
    useCtxAssessment: [, setCtxAssessment],
  } = useContext(GlobalContext);

  const fetchAssessments = () => {
    getData<Assessment[]>(`/api/customers/${customerId}/assessments`, setAssessmentsData);
  };

  function filterTemplatesByType(type: string) {
    const matches = allTemplatesRef.current.filter(t => t.file_type === type);
    setExportTemplateOptions(matches);
    setSelectedExportTemplate(matches[0] || null);
  }

  function fetchTemplates() {
    getData<Customer>(`/api/customers/${customerId}`, customerData => {
      getData<Template[]>("/api/templates", allTemplates => {
        const all = [...customerData.templates, ...allTemplates];
        const uniqueTemplates = Array.from(new Map(all.map(t => [t.file_id, t])).values());

        allTemplatesRef.current = uniqueTemplates;
        filterTemplatesByType(exportType.value);
      });
    });
  }

  useEffect(() => {
    document.title = getPageTitle("Assessments");
    fetchAssessments();
    fetchTemplates();
  }, []);

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
      setAssessmentsData(prev => [...prev, clonedAssessment]);
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
      setAssessmentsData(prev => prev.filter(a => a.id !== assessmentToDelete.id));
      setIsModalTrashActive(false);
      setAssessmentToDelete(null);
      toast.success("Assessment deleted successfully");
    });
  };

  const handleStatusChange = (assessmentId: string, selectedOption: SelectOption) => {
    patchData<Assessment>(`/api/assessments/${assessmentId}`, { status: selectedOption.value }, updatedAssessment => {
      setAssessmentsData(prev => prev.map(a => (a.id === assessmentId ? updatedAssessment : a)));
    });
  };

  const openExportModal = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    setIsModalDownloadActive(true);
  };

  const exportAssessment = () => {
    const payload = {
      type: exportType.value,
      template: selectedExportTemplate.file_id,
      encryption: exportEncryption.value,
      password: exportEncryption.value === "password" ? exportPassword : undefined,
    };

    // TODO properly with docx-go-template
    postData<Blob>(`/api/assessments/${selectedAssessmentId}/export`, payload, data => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const assessment = assessmentsData.find(a => a.id === selectedAssessmentId);
      const fileName = `${assessment?.name || "assessment"}_export.${exportType.value === "word" ? "docx" : exportType.value === "excel" ? "xlsx" : "zip"}`;
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setIsModalDownloadActive(false);
      toast.success("Export started");
    });
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
            value={exportType}
            onChange={option => setExportType(option)}
          />
          <SelectWrapper
            label="Template Type"
            id="template"
            options={exportTemplateOptions.map(t => ({
              value: t.file_id,
              label: t.type ? `${t.name} (${t.type})` : t.name,
            }))}
            value={
              selectedExportTemplate
                ? {
                    value: selectedExportTemplate.file_id,
                    label: selectedExportTemplate.type
                      ? `${selectedExportTemplate.name} (${selectedExportTemplate.type})`
                      : selectedExportTemplate.name,
                  }
                : null
            }
            onChange={option => {
              const selected = exportTemplateOptions.find(t => t.id === option.value) || null;
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
          {exportEncryption.value === "password" && (
            <Input
              type="password"
              id="password"
              placeholder="Insert password"
              value={exportPassword}
              onChange={e => setExportPassword(e.target.value)}
            />
          )}
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

      <SectionTitleLineWithButton icon={mdiTabSearch} title="Assessments">
        <Button
          icon={mdiPlus}
          text="New assessment"
          small
          onClick={() => navigate(`/customers/${customerId}/assessments/new`)}
        />
      </SectionTitleLineWithButton>

      <Table
        data={assessmentsData?.map(assessment => ({
          Title: (
            <Link
              to={`/customers/${customerId}/assessments/${assessment.id}/vulnerabilities`}
              onClick={() => setCtxAssessment(assessment)}
            >
              {assessment.name}
            </Link>
          ),
          Type: assessment.assessment_type,
          "CVSS Versions": assessment.cvss_versions?.join(" | "),
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
      />
    </div>
  );
}
