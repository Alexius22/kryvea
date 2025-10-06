import { mdiDownload, mdiPencil, mdiPlus, mdiTrashCan, mdiUpload } from "@mdi/js";
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { deleteData, getData, postData } from "../api/api";
import { GlobalContext } from "../App";
import Card from "../components/Composition/Card";
import Divider from "../components/Composition/Divider";
import Flex from "../components/Composition/Flex";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import PageHeader from "../components/Composition/PageHeader";
import Table from "../components/Composition/Table";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Checkbox from "../components/Form/Checkbox";
import DateCalendar from "../components/Form/DateCalendar";
import Input from "../components/Form/Input";
import Label from "../components/Form/Label";
import SelectWrapper from "../components/Form/SelectWrapper";
import UploadFile from "../components/Form/UploadFile";
import AddTargetModal from "../components/Modals/AddTargetModal";
import ExportReportModal from "../components/Modals/ExportReportModal";
import { useDebounce } from "../hooks/hooks";
import { Category, Template, Vulnerability } from "../types/common.types";
import { CVSS_VERSIONS } from "../utils/constants";
import { formatDate } from "../utils/dates";
import { getPageTitle } from "../utils/helpers";
import { getTargetLabel } from "../utils/targetLabel";

const DEFAULT_QUERY = "";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;

export default function AssessmentVulnerabilities() {
  const navigate = useNavigate();
  const {
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
  const [totalVulnerabilities, setTotalVulnerabilities] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingVulnerabilities, setLoadingVulnerabilities] = useState(true);
  const [vulnerabilityToDelete, setVulnerabilityToDelete] = useState<Vulnerability | null>(null);

  const searchAPI = useMemo(() => `/api/assessments/${assessmentId}/vulnerabilities?`, []);
  const urlSearchParams = new URLSearchParams(location.search);

  // Main search
  const [query, setQuery] = useState(urlSearchParams.get("query") ?? DEFAULT_QUERY);
  const debouncedQuery = useDebounce(query, 400);

  // Pagination
  const [page, setPage] = useState(Math.max(+urlSearchParams.get("page") || DEFAULT_PAGE, DEFAULT_PAGE));
  const [limit, setLimit] = useState(+urlSearchParams.get("limit") || DEFAULT_LIMIT);

  // Filters
  const [assessment, setAssessment] = useState(urlSearchParams.get("assessment") ?? "");
  const [user, setUser] = useState(urlSearchParams.get("user") ?? "");
  const [customer, setCustomer] = useState(urlSearchParams.get("customer") ?? "");
  const [cvssMin, setCvssMin] = useState(urlSearchParams.get("cvss_min") ?? "");
  const [cvssMax, setCvssMax] = useState(urlSearchParams.get("cvss_max") ?? "");
  const [cvssVersions, setCvssVersions] = useState<string[]>(
    urlSearchParams.get("cvss_versions")?.split(",").filter(Boolean) ?? []
  );
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: urlSearchParams.get("start_date_time") ?? "",
    end: urlSearchParams.get("end_date_time") ?? "",
  });

  function fetchVulnerabilitiesPaginated(searchParams) {
    setLoadingVulnerabilities(true);
    getData<any>(
      searchAPI + searchParams,
      data => {
        setTotalVulnerabilities(data.total_documents);
        setVulnerabilities(data.data);
        setTotalPages(data.total_pages);
      },
      undefined,
      () => setLoadingVulnerabilities(false)
    );
  }

  useEffect(() => {
    document.title = getPageTitle("Assessment Vulnerabilities");
    getData<Template[]>("/api/templates", setAllTemplates);
  }, []);

  // Sync with URL when user uses browser buttons
  useEffect(() => {
    setQuery(urlSearchParams.get("query") ?? DEFAULT_QUERY);
    setPage(Math.max(+urlSearchParams.get("page") || DEFAULT_PAGE, DEFAULT_PAGE));
    setLimit(+urlSearchParams.get("limit") || DEFAULT_LIMIT);
    setAssessment(urlSearchParams.get("assessment") ?? "");
    setUser(urlSearchParams.get("user") ?? "");
    setCustomer(urlSearchParams.get("customer") ?? "");
    setCvssMin(urlSearchParams.get("cvss_min") ?? "");
    setCvssMax(urlSearchParams.get("cvss_max") ?? "");
    setCvssVersions(urlSearchParams.get("cvss_versions")?.split(",").filter(Boolean) ?? []);
    setDateRange({
      start: urlSearchParams.get("start_date_time") ?? "",
      end: urlSearchParams.get("end_date_time") ?? "",
    });
  }, [location.search]);

  // Fetch data
  useEffect(() => {
    const searchParams = buildSearchParams();

    if (location.search !== `?${searchParams}`) {
      navigate(`?${searchParams}`, { replace: false });
    }

    fetchVulnerabilitiesPaginated(searchParams);
  }, [debouncedQuery, limit, page]);

  // Build API params
  const buildSearchParams = () => {
    const sp = new URLSearchParams({
      query: debouncedQuery,
      page: page.toString(),
      limit: limit.toString(),
    });

    if (assessment) sp.set("assessment", assessment);
    if (user) sp.set("user", user);
    if (customer) sp.set("customer", customer);
    if (cvssMin) sp.set("cvss_min", cvssMin);
    if (cvssMax) sp.set("cvss_max", cvssMax);
    if (cvssVersions.length) sp.set("cvss_versions", cvssVersions.join(","));
    if (dateRange.start) sp.set("start_date_time", dateRange.start);
    if (dateRange.end) sp.set("end_date_time", dateRange.end);

    return sp.toString();
  };

  // Actions
  const handleSearch = () => {
    setPage(1); // reset page
    const searchParams = buildSearchParams();
    navigate(`?${searchParams}`);
    fetchVulnerabilitiesPaginated(searchParams);
  };

  const handleClearAll = () => {
    setQuery("");
    setAssessment("");
    setUser("");
    setCustomer("");
    setCvssMin("");
    setCvssMax("");
    setCvssVersions([]);
    setDateRange({ start: "", end: "" });
    setPage(DEFAULT_PAGE);
    setLimit(DEFAULT_LIMIT);
    navigate("?");
  };

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
        setPage(1); // trigger data refetch
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
          language={ctxAssessment.language || "en"}
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

      <Grid className="gap-4">
        <Card>
          <Grid className="grid-cols-3 !items-start gap-4">
            <Input
              type="text"
              id="assessment"
              label="Assessment"
              placeholder="Assessment name"
              value={assessment}
              onChange={e => setAssessment(e.target.value)}
              onEnter={handleSearch}
            />
            <Input
              type="text"
              id="user"
              label="User"
              placeholder="User"
              value={user}
              onChange={e => setUser(e.target.value)}
              onEnter={handleSearch}
            />
            <Grid className="h-full items-center justify-center">
              <Label text="CVSS Versions" className="text-center" />
              <Flex className="gap-4">
                {CVSS_VERSIONS.map(({ value, label }) => (
                  <Checkbox
                    disabled
                    id={`cvss_${value}`}
                    label={label}
                    checked={cvssVersions.includes(value)}
                    onChange={() => {
                      setCvssVersions(prev =>
                        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
                      );
                    }}
                    key={value}
                  />
                ))}
              </Flex>
            </Grid>
            <DateCalendar
              idStart="start_date_time"
              label="Range date"
              isRange
              value={dateRange}
              onChange={val => {
                const { start, end } = val as { start: string; end: string };
                setDateRange({ start, end });
              }}
              placeholder={{ start: "Start date", end: "End date" }}
            />
            <Input
              disabled
              helperSubtitle="Work in progress"
              type="text"
              id="customer"
              label="Customer"
              placeholder="Customer name"
              value={customer}
              onChange={e => setCustomer(e.target.value)}
              onEnter={handleSearch}
            />
            <Flex className="gap-4">
              <Input
                type="text"
                id="cvss_min_score"
                label="CVSS Min"
                placeholder="CVSS min"
                value={cvssMin}
                onChange={e => setCvssMin(e.target.value)}
                onEnter={handleSearch}
              />
              <Input
                type="text"
                id="cvss_max_score"
                label="CVSS Max"
                placeholder="CVSS max"
                value={cvssMax}
                onChange={e => setCvssMax(e.target.value)}
                onEnter={handleSearch}
              />
            </Flex>
          </Grid>
          <Divider />
          <Flex items="center" justify="between">
            <span>
              Total vulnerabilities found: <b>{totalVulnerabilities}</b>
            </span>
            <Flex className="gap-2">
              <Button text="Clear all" variant="outline-only" onClick={handleClearAll} />
              <Button text="Search" onClick={handleSearch} />
            </Flex>
          </Flex>
        </Card>

        <Table
          loading={loadingVulnerabilities}
          backendCurrentPage={page}
          backendTotalRows={totalVulnerabilities}
          backendTotalPages={totalPages}
          backendSearch={query}
          onBackendSearch={setQuery}
          onBackendChangePage={setPage}
          onBackendChangePerPage={setLimit}
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
                  {vulnerability.category.identifier} - {vulnerability.category.name}{" "}
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
          perPageCustom={limit}
          maxWidthColumns={{ Vulnerability: "35rem", Target: "25rem" }}
        />
      </Grid>
    </div>
  );
}
