import { mdiDownload, mdiFileEye, mdiListBox, mdiPencil, mdiPlus, mdiTrashCan, mdiUpload } from "@mdi/js";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { deleteData, getData, postData } from "../api/api";
import { GlobalContext } from "../App";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import { formatDate } from "../components/dateUtils";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import Label from "../components/Form/Label";
import SelectWrapper from "../components/Form/SelectWrapper";
import { SelectOption } from "../components/Form/SelectWrapper.types";
import UploadFile from "../components/Form/UploadFile";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { Vulnerability } from "../types/common.types";

export default function AssessmentVulnerabilities() {
  const navigate = useNavigate();
  const {
    useCtxCustomer: [ctxCustomer],
    useCtxVulnerability: [, setCtxVulnerability],
  } = useContext(GlobalContext);
  const { assessmentId, customerId } = useParams<{ customerId: string; assessmentId: string }>();

  const [isModalDownloadActive, setIsModalDownloadActive] = useState(false);
  const [isModalUploadActive, setIsModalUploadActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);

  const [fileObj, setFileObj] = useState<File | null>(null);

  const [exportType, setExportType] = useState<SelectOption>({ value: "word", label: "Word (.docx)" });
  const [exportEncryption, setExportEncryption] = useState<SelectOption>({ value: "none", label: "None" });
  const [exportPassword, setExportPassword] = useState("");

  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [vulnerabilityToDelete, setVulnerabilityToDelete] = useState<Vulnerability | null>(null);

  useEffect(() => {
    document.title = getPageTitle("Assessment");

    getData<Vulnerability[]>(
      `/api/assessments/${assessmentId}/vulnerabilities`,
      data => setVulnerabilities(data),
      err => {
        const errorMessage = err.response.data.error;
        toast.error(errorMessage);
      }
    );
  }, [assessmentId]);

  const openExportModal = () => {
    setIsModalDownloadActive(true);
  };

  const exportAssessment = () => {
    const payload = {
      type: exportType.value,
      encryption: exportEncryption.value,
      password: exportEncryption.value === "password" ? exportPassword : undefined,
    };

    // TODO properly with docx-go-template
    postData<Blob>(
      `/api/customers/${customerId}/assessments/${assessmentId}/export`,
      payload,
      data => {
        const url = window.URL.createObjectURL(new Blob([data]));
        const fileName = `${assessmentId}_export.${exportType.value === "word" ? "docx" : exportType.value === "excel" ? "xlsx" : "zip"}`;
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setIsModalDownloadActive(false);
        toast.success("Export started");
      },
      err => {
        const errorMessage = err.response.data.error;
        toast.error(errorMessage);
      }
    );
  };

  const openDeleteModal = (vulnerability: Vulnerability) => {
    setVulnerabilityToDelete(vulnerability);
    setIsModalTrashActive(true);
  };

  const confirmDelete = () => {
    deleteData(
      `/api/assessments/${assessmentId}/vulnerabilities/${vulnerabilityToDelete.id}`,
      () => {
        setVulnerabilities(prev => prev.filter(v => v.id !== vulnerabilityToDelete.id));
        toast.success("Vulnerability deleted successfully");
        setIsModalTrashActive(false);
        setVulnerabilityToDelete(null);
      },
      err => {
        const errorMessage = err.response.data.error;
        toast.error(errorMessage);
      }
    );
  };

  const changeFile = ({ target: { files } }: React.ChangeEvent<HTMLInputElement>) => {
    if (!files || !files[0]) return;
    setFileObj(files[0]);
  };

  const clearFile = () => setFileObj(null);

  return (
    <div>
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

      {/* Upload Modal */}
      <Modal
        title="Upload file"
        buttonLabel="Confirm"
        isActive={isModalUploadActive}
        onConfirm={() => {
          // TODO: Implement upload logic here
          setIsModalUploadActive(false);
          toast.success("Upload confirmed (implement upload logic)");
        }}
        onCancel={() => setIsModalUploadActive(false)}
      >
        <Label text={"Choose bulk file"} />
        <UploadFile
          inputId={"nessus_file"}
          filename={fileObj?.name}
          name={"imagePoc"}
          accept={".nessus,text/xml"}
          onChange={changeFile}
          onButtonClick={clearFile}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Please confirm: action irreversible"
        buttonLabel="Confirm"
        isActive={isModalTrashActive}
        onConfirm={confirmDelete}
        onCancel={() => setIsModalTrashActive(false)}
      >
        <p>Are you sure to delete this vulnerability?</p>
      </Modal>

      <SectionTitleLineWithButton icon={mdiListBox} title={`${vulnerabilities[0]?.assessment.name}`}>
        <Buttons>
          <Button icon={mdiFileEye} text="Live editor" small disabled onClick={() => navigate("/live_editor")} />
          <Button icon={mdiDownload} text="Download report" small onClick={openExportModal} />
          <Button
            icon={mdiPlus}
            text="New Target"
            small
            onClick={() => navigate(`/customers/${ctxCustomer.id}/targets/add_target`)}
          />
          <Button
            icon={mdiPlus}
            text="New vulnerability"
            small
            onClick={() => navigate(`/assessments/${assessmentId}/vulnerabilities/add_vulnerability`)}
          />
          <Button icon={mdiUpload} text="Upload" small onClick={() => setIsModalUploadActive(true)} />
        </Buttons>
      </SectionTitleLineWithButton>

      <Table
        data={vulnerabilities.map(vulnerability => ({
          Vulnerability: (
            <Link
              to={`/assessments/${assessmentId}/vulnerabilities/${vulnerability.id}/detail`}
              onClick={() => setCtxVulnerability(vulnerability)}
            >
              {vulnerability.category.index}: {vulnerability.category.name}{" "}
              {vulnerability.detailed_title && `(${vulnerability.detailed_title})`}
            </Link>
          ),
          Target: (() => {
            const ip = vulnerability.target.ipv4 || vulnerability.target.ipv6;
            if (ip) {
              return ip + (vulnerability.target.fqdn ? ` - ${vulnerability.target.fqdn}` : "");
            }
            return vulnerability.target.fqdn;
          })(),
          "CVSSv3.1 Score": vulnerability.cvssv31.cvss_score,
          "CVSSv4.0 Score": vulnerability.cvssv4.cvss_score,
          "Last update": formatDate(vulnerability.updated_at),
          buttons: (
            <Buttons noWrap>
              <Button
                icon={mdiPencil}
                small
                onClick={() => navigate(`/assessments/${assessmentId}/vulnerabilities/${vulnerability.id}`)}
              />
              <Button type="danger" icon={mdiTrashCan} onClick={() => openDeleteModal(vulnerability)} small />
            </Buttons>
          ),
        }))}
        perPageCustom={10}
      />
    </div>
  );
}
