import { mdiDownload, mdiPencil, mdiPlus, mdiTrashCan, mdiUpload } from "@mdi/js";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { deleteData, getData, postData } from "../api/api";
import { GlobalContext } from "../App";
import Flex from "../components/Composition/Flex";
import Modal from "../components/Composition/Modal";
import PageHeader from "../components/Composition/PageHeader";
import Table from "../components/Composition/Table";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import SelectWrapper from "../components/Form/SelectWrapper";
import UploadFile from "../components/Form/UploadFile";
import AddTargetModal from "../components/Modals/AddTargetModal";
import ExportReportModal from "../components/Modals/ExportReportModal";
import { Category, Template, Vulnerability } from "../types/common.types";
import { formatDate } from "../utils/dates";
import { getPageTitle } from "../utils/helpers";
import { getTargetLabel } from "../utils/targetLabel";

export default function AssessmentVulnerabilities() {
  const navigate = useNavigate();
  const {
    useCtxCustomer: [ctxCustomer],
    useCtxVulnerability: [, setCtxVulnerability],
    useCtxAssessment: [ctxAssessment],
  } = useContext(GlobalContext);
  const { assessmentId } = useParams<{ assessmentId: string }>();

  const [isModalTargetActive, setIsModalTargetActive] = useState(false);
  const [isModalDownloadActive, setIsModalDownloadActive] = useState(false);
  const [isModalUploadActive, setIsModalUploadActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);

  const sourceOptions = [
    { label: "Nessus", value: "nessus" },
    { label: "Burp", value: "burp" },
  ];
  const [source, setSource] = useState<Category["source"]>();
  const [fileObj, setFileObj] = useState<File | null>(null);

  const [allTemplates, setAllTemplates] = useState<Template[]>([]);

  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loadingVulnerabilities, setLoadingVulnerabilities] = useState(true);
  const [vulnerabilityToDelete, setVulnerabilityToDelete] = useState<Vulnerability | null>(null);

  function fetchVulnerabilities() {
    setLoadingVulnerabilities(true);
    getData<Vulnerability[]>(`/api/assessments/${assessmentId}/vulnerabilities`, setVulnerabilities, undefined, () =>
      setLoadingVulnerabilities(false)
    );
  }

  useEffect(() => {
    document.title = getPageTitle("Assessment Vulnerabilities");
    fetchVulnerabilities();
    getData<Template[]>("/api/templates", setAllTemplates);
  }, []);

  const openExportModal = () => {
    setIsModalDownloadActive(true);
  };

  const openTargetModal = () => {
    setIsModalTargetActive(true);
  };

  const openDeleteModal = (vulnerability: Vulnerability) => {
    setVulnerabilityToDelete(vulnerability);
    setIsModalTrashActive(true);
  };

  const confirmDelete = () => {
    deleteData(`/api/vulnerabilities/${vulnerabilityToDelete.id}`, () => {
      setVulnerabilities(prev => prev.filter(v => v.id !== vulnerabilityToDelete.id));
      toast.success("Vulnerability deleted successfully");
      setIsModalTrashActive(false);
      setVulnerabilityToDelete(null);
    });
  };

  const changeFile = ({ target: { files } }: React.ChangeEvent<HTMLInputElement>) => {
    if (!files || !files[0]) return;

    const file = files[0];
    setFileObj(file);

    setSource(null);
    if (file.name.endsWith(".nessus")) {
      setSource("nessus");
    }
  };

  const clearFile = () => setFileObj(null);

  const handleUploadBulk = () => {
    if (!fileObj) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!source) {
      toast.error("Please select the source type");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileObj);
    formData.append("import_data", `{"source": "${source}"}`);

    const toastId = toast.loading("Uploading...");
    postData<{ message: string }>(
      `/api/assessments/${assessmentId}/upload`,
      formData,
      () => {
        toast.update(toastId, {
          render: "Vulnerabilities uploaded successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
        setIsModalUploadActive(false);
        setFileObj(null);
        fetchVulnerabilities();
      },
      err => {
        toast.update(toastId, {
          render: err.response.data.error,
          type: "error",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
        setFileObj(null);
      }
    );
  };

  return (
    <div>
      {/* Add Target Modal */}
      {isModalTargetActive && <AddTargetModal setShowModal={setIsModalTargetActive} assessmentId={assessmentId} />}

      {isModalDownloadActive && (
        <ExportReportModal
          setShowModal={setIsModalDownloadActive}
          assessmentId={assessmentId}
          templates={allTemplates}
          language={ctxCustomer.language}
        />
      )}

      {/* Upload Modal */}
      {isModalUploadActive && (
        <Modal
          title="Upload file"
          confirmButtonLabel="Confirm"
          onConfirm={() => {
            handleUploadBulk();
            setIsModalUploadActive(false);
          }}
          onCancel={() => setIsModalUploadActive(false)}
        >
          <Flex col className="gap-2">
            <p>Upload vulnerability scan export files from the available sources.</p>
            <UploadFile
              label="Choose bulk file"
              inputId={"file"}
              filename={fileObj?.name}
              name={"imagePoc"}
              accept={".nessus,text/xml"}
              onChange={changeFile}
              onButtonClick={clearFile}
            />
            <SelectWrapper
              label="Source"
              className="w-1/2"
              id="source"
              options={sourceOptions}
              value={source ? { label: source.charAt(0).toUpperCase() + source.slice(1), value: source } : null}
              onChange={option => setSource(option.value)}
            />
          </Flex>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isModalTrashActive && (
        <Modal
          title="Please confirm: action irreversible"
          confirmButtonLabel="Confirm"
          onConfirm={confirmDelete}
          onCancel={() => setIsModalTrashActive(false)}
        >
          <p>Are you sure to delete this vulnerability?</p>
        </Modal>
      )}

      <PageHeader title={`${ctxAssessment?.name} - Vulnerabilities`}>
        <Buttons>
          <Button icon={mdiPlus} text="New vulnerability" small onClick={() => navigate(`new`)} />
          <Button icon={mdiPlus} text="New Target" small onClick={openTargetModal} />
          <Button icon={mdiUpload} text="Upload" small onClick={() => setIsModalUploadActive(true)} />
          <Button icon={mdiDownload} text="Download report" small onClick={openExportModal} />
          {/* <Button icon={mdiFileEye} text="Live editor" small disabled onClick={() => navigate("/live_editor")} /> */}
        </Buttons>
      </PageHeader>

      <Table
        loading={loadingVulnerabilities}
        data={vulnerabilities.map(vulnerability => {
          const cvssColumns = {};
          if (ctxAssessment?.cvss_versions["3.1"]) {
            cvssColumns["CVSSv3.1 Score"] = vulnerability.cvssv31.score;
          }
          if (ctxAssessment?.cvss_versions["4.0"]) {
            cvssColumns["CVSSv4.0 Score"] = vulnerability.cvssv4.score;
          }

          return {
            Vulnerability: (
              <Link to={`${vulnerability.id}`} onClick={() => setCtxVulnerability(vulnerability)}>
                {vulnerability.category.index} - {vulnerability.category.name}{" "}
                {vulnerability.detailed_title && `(${vulnerability.detailed_title})`}
              </Link>
            ),
            Target: getTargetLabel(vulnerability.target),

            ...cvssColumns,

            Status: vulnerability.status,
            "Last update": formatDate(vulnerability.updated_at),
            buttons: (
              <Buttons noWrap>
                <Button icon={mdiPencil} small onClick={() => navigate(`${vulnerability.id}/edit`)} />
                <Button variant="danger" icon={mdiTrashCan} onClick={() => openDeleteModal(vulnerability)} small />
              </Buttons>
            ),
          };
        })}
        perPageCustom={25}
        maxWidthColumns={{ Vulnerability: "35rem", Target: "25rem" }}
      />
    </div>
  );
}
