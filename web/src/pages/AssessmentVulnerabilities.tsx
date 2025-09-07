import { mdiDownload, mdiListBox, mdiPencil, mdiPlus, mdiTrashCan, mdiUpload } from "@mdi/js";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { deleteData, getData, postData } from "../api/api";
import { GlobalContext } from "../App";
import Flex from "../components/Composition/Flex";
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
import UploadFile from "../components/Form/UploadFile";
import { Category, exportTypes, Template, Vulnerability } from "../types/common.types";
import { formatDate } from "../utils/dates";
import { getPageTitle } from "../utils/helpers";

export default function AssessmentVulnerabilities() {
  const navigate = useNavigate();
  const {
    useCtxCustomer: [ctxCustomer],
    useCtxVulnerability: [, setCtxVulnerability],
    useCtxAssessment: [ctxAssessment],
  } = useContext(GlobalContext);
  const { assessmentId } = useParams<{ assessmentId: string }>();

  const [isModalDownloadActive, setIsModalDownloadActive] = useState(false);
  const [isModalUploadActive, setIsModalUploadActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);

  const sourceOptions = [
    { label: "Nessus", value: "nessus" },
    { label: "Burp", value: "burp" },
  ];
  const [source, setSource] = useState<Category["source"]>();
  const [fileObj, setFileObj] = useState<File | null>(null);

  const [selectedExportTypeOption, setSelectedExportTypeOption] = useState<SelectOption>(exportTypes[0]);
  const [templatesByTypeAndLanguage, setTemplatesByTypeAndLanguage] = useState<Template[]>([]);
  const [templateOptions, setTemplateOptions] = useState<SelectOption[]>([]);
  const [selectedExportTemplate, setSelectedExportTemplate] = useState<Template | null>(null);
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);

  const [exportEncryption, setExportEncryption] = useState<SelectOption>({ value: "none", label: "None" });
  const [exportPassword, setExportPassword] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString());

  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loadingVulnerabilities, setLoadingVulnerabilities] = useState(true);
  const [vulnerabilityToDelete, setVulnerabilityToDelete] = useState<Vulnerability | null>(null);

  function fetchVulnerabilities() {
    setLoadingVulnerabilities(true);
    getData<Vulnerability[]>(`/api/assessments/${assessmentId}/vulnerabilities`, setVulnerabilities, undefined, () =>
      setLoadingVulnerabilities(false)
    );
  }

  const getTemplatesByTypeAndLanguage = () =>
    allTemplates.filter(t => t.language === ctxCustomer.language && t.mime_type === selectedExportTypeOption.value);

  useEffect(() => {
    document.title = getPageTitle("Assessment Vulnerabilities");
    fetchVulnerabilities();
    getData<Template[]>("/api/templates", setAllTemplates);
  }, []);

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

  const openExportModal = () => {
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
      `/api/assessments/${assessmentId}/export`,
      payload,
      data => {
        const url = window.URL.createObjectURL(data);
        const extension =
          selectedExportTypeOption.value === "word"
            ? "docx"
            : selectedExportTypeOption.value === "excel"
              ? "xlsx"
              : "zip";
        const fileName = `${ctxAssessment?.name ?? "assessment"}_export.${extension}`;

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
    postData<{ message: string }>(`/api/assessments/${assessmentId}/upload`, formData, () => {
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
    });
  };

  return (
    <div>
      {/* Download Modal */}
      {isModalDownloadActive && (
        <Modal
          title="Download report"
          confirmButtonLabel="Confirm"
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

      <PageHeader icon={mdiListBox} title={`${ctxAssessment?.name} - Vulnerabilities`}>
        <Buttons>
          <Button icon={mdiPlus} text="New vulnerability" small onClick={() => navigate(`new`)} />
          <Button
            icon={mdiPlus}
            text="New Target"
            small
            onClick={() => navigate(`/customers/${ctxCustomer.id}/targets/new`)}
          />
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
            cvssColumns["CVSSv3.1 Score"] = vulnerability.cvssv31.cvss_score;
          }
          if (ctxAssessment?.cvss_versions["4.0"]) {
            cvssColumns["CVSSv4.0 Score"] = vulnerability.cvssv4.cvss_score;
          }

          return {
            Vulnerability: (
              <Link to={`${vulnerability.id}`} onClick={() => setCtxVulnerability(vulnerability)}>
                {vulnerability.category.index} - {vulnerability.category.name}{" "}
                {vulnerability.detailed_title && `(${vulnerability.detailed_title})`}
              </Link>
            ),
            Target: (() => {
              const ip = vulnerability.target.ipv4 || vulnerability.target.ipv6 || "";
              const fqdn = vulnerability.target.fqdn || "";
              const name = vulnerability.target.name ? ` (${vulnerability.target.name})` : "";

              if (ip) {
                return `${ip}${fqdn ? ` - ${fqdn}` : ""}${name}`;
              }
              return `${fqdn}${name}`;
            })(),

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
        perPageCustom={10}
        maxWidthColumns={{ Vulnerability: "35rem", Target: "25rem" }}
      />
    </div>
  );
}
