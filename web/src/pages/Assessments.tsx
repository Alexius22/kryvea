import { mdiContentDuplicate, mdiDownload, mdiFileEdit, mdiPlus, mdiStar, mdiTabSearch, mdiTrashCan } from "@mdi/js";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { deleteData, getData, patchData, postData } from "../api/api";
import { GlobalContext } from "../App";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import { formatDate } from "../components/dateUtils";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import { SelectOption } from "../components/Form/SelectWrapper.types";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { Assessment } from "../types/common.types";

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

  const [exportType, setExportType] = useState<SelectOption>({ value: "word", label: "Word (.docx)" });
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

  useEffect(() => {
    document.title = getPageTitle("Assessments");
    getData<Assessment[]>(`/api/customers/${customerId}/assessments`, setAssessmentsData);
  }, []);

  const handleFavoriteToggle = (id: string) => () => {
    const updatedAssessments = assessmentsData.map(assessment => {
      if (assessment.id === id) {
        const updated = { ...assessment, is_owned: !assessment.is_owned };
        patchData(`/api/users/me/assessments`, { assessment: assessment.id, is_owned: updated.is_owned });
        return updated;
      }
      return assessment;
    });
    setAssessmentsData(updatedAssessments);
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
        buttonLabel="Confirm"
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
        buttonLabel="Confirm"
        isActive={isModalDownloadActive}
        onConfirm={exportAssessment}
        onCancel={() => setIsModalDownloadActive(false)}
      >
        <Grid>
          <SelectWrapper
            label="Type"
            id="type"
            options={[
              { value: "word", label: "Word (.docx)" },
              { value: "excel", label: "Excel (.xlsx)" },
              { value: "zip", label: "Archive (.zip)" },
            ]}
            value={exportType}
            onChange={option => setExportType(option)}
          />
          <Grid className="grid-cols-2">
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
        </Grid>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Please confirm: action irreversible"
        buttonLabel="Confirm"
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
        data={assessmentsData.map(assessment => ({
          Title: (
            <Link to={`${assessment.id}/vulnerabilities`} onClick={() => setCtxAssessment(assessment)}>
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
                onClick={handleFavoriteToggle(assessment.id)}
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
