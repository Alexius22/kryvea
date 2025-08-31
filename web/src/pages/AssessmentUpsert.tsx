import { mdiPlus } from "@mdi/js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { getData, patchData, postData } from "../api/api";
import Card from "../components/CardBox/Card";
import Flex from "../components/Composition/Flex";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Checkbox from "../components/Form/Checkbox";
import DateCalendar from "../components/Form/DateCalendar";
import Input from "../components/Form/Input";
import Label from "../components/Form/Label";
import SelectWrapper from "../components/Form/SelectWrapper";
import { SelectOption } from "../components/Form/SelectWrapper.types";
import { getPageTitle } from "../config";
import { Assessment, Target } from "../types/common.types";

const ASSESSMENT_TYPE: SelectOption[] = [
  {
    value: { short: "VAPT", full: "Vulnerability Assessment Penetration Test" },
    label: "Vulnerability Assessment Penetration Test",
  },
  { value: { short: "NPT", full: "Network Penetration Test" }, label: "Network Penetration Test" },
  { value: { short: "WAPT", full: "Web Application Penetration Test" }, label: "Web Application Penetration Test" },
  {
    value: { short: "MAPT", full: "Mobile Application Penetration Test" },
    label: "Mobile Application Penetration Test",
  },
  { value: { short: "API PT", full: "API Penetration Test" }, label: "API Penetration Test" },
  { value: { short: "RT", full: "Red Team Assessment" }, label: "Red Team Assessment" },
  { value: { short: "IOT PT", full: "IoT Device Penetration Test" }, label: "IoT Device Penetration Test" },
];

const CVSS_VERSIONS: SelectOption[] = [
  { value: "3.1", label: "3.1" },
  { value: "4.0", label: "4.0" },
];

const ENVIRONMENT: SelectOption[] = [
  { value: "Pre-Production", label: "Pre-Production" },
  { value: "Production", label: "Production" },
];

const TESTING_TYPE: SelectOption[] = [
  { value: "White Box", label: "White Box" },
  { value: "Gray Box", label: "Gray Box" },
  { value: "Black Box", label: "Black Box" },
];

const OSSTMM_VECTOR: SelectOption[] = [
  { value: "Inside to Inside", label: "Inside to Inside" },
  { value: "Inside to Outside", label: "Inside to Outside" },
  { value: "Outside to Outside", label: "Outside to Outside" },
  { value: "Outside to Inside", label: "Outside to Inside" },
];

function getOption(options: SelectOption[], value: string): SelectOption | undefined {
  return options.find(opt => opt.value === value);
}

export default function AssessmentUpsert() {
  const navigate = useNavigate();
  const { customerId, assessmentId } = useParams<{ customerId: string; assessmentId?: string }>();
  const [targets, setTargets] = useState<Target[]>([]);
  const isEdit = Boolean(assessmentId);
  const [isModalTargetActive, setIsModalTargetActive] = useState(false);

  const [ipv4, setIpv4] = useState("");
  const [ipv6, setIpv6] = useState("");
  const [fqdn, setFqdn] = useState("");
  const [hostName, setHostName] = useState("");

  const [form, setForm] = useState<
    Omit<Assessment, "id" | "created_at" | "updated_at" | "vulnerability_count" | "customer" | "is_owned">
  >({
    assessment_type: undefined,
    name: "",
    start_date_time: new Date().toISOString(),
    end_date_time: new Date().toISOString(),
    kickoff_date_time: new Date().toISOString(),
    targets: [],
    status: "On Hold",
    cvss_versions: { "3.1": false, "4.0": false },
    environment: "",
    testing_type: "",
    osstmm_vector: "",
  });

  const [kickoffDate, setKickoffDate] = useState(new Date().toISOString());

  const [assessment, setAssessment] = useState<Assessment | null>(null);

  const fetchTargets = () => {
    getData<Target[]>(`/api/customers/${customerId}/targets`, setTargets);
  };

  useEffect(() => {
    document.title = getPageTitle(isEdit ? "Edit Assessment" : "Add Assessment");
    fetchTargets();

    if (isEdit) {
      getData<Assessment>(
        `/api/assessments/${assessmentId}`,
        data => {
          setAssessment(data);
          setForm({
            assessment_type: data.assessment_type,
            name: data.name,
            start_date_time: data.start_date_time,
            end_date_time: data.end_date_time,
            kickoff_date_time: data.kickoff_date_time,
            targets: data.targets,
            status: data.status,
            cvss_versions: data.cvss_versions,
            environment: data.environment,
            testing_type: data.testing_type,
            osstmm_vector: data.osstmm_vector,
          });
        },
        err => {
          toast.error(err.response.data.error);
          navigate(`/customers/${customerId}/assessments`);
        }
      );
    }
  }, [isEdit, customerId, assessmentId, navigate]);

  const targetOptions: SelectOption[] = targets.map(target => ({
    value: target.id,
    label:
      target.fqdn && (target.ipv4 || target.ipv6)
        ? `${target.fqdn} - ${target.ipv4 || target.ipv6}${target.name ? ` (${target.name})` : ""}`
        : (target.fqdn || target.ipv4 || target.ipv6) + (target.name ? ` (${target.name})` : ""),
  }));

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSelectChange = (field: keyof typeof form, option: SelectOption | null) => {
    handleChange(field, option ? option.value : "");
  };

  const toggleCvssVersion = (version: string) => {
    setForm(prev => ({
      ...prev,
      cvss_versions: {
        ...prev.cvss_versions,
        [version]: !prev.cvss_versions[version],
      },
    }));
  };

  const handleTargetsChange = (options: SelectOption[] | null) => {
    handleChange("targets", options ? options.map(opt => targets.find(t => t.id === opt.value)!).filter(Boolean) : []);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      targets: form.targets.map(target => target.id),
      customer_id: customerId,
    };

    const endpoint = isEdit ? `/api/assessments/${assessmentId}` : `/api/assessments`;

    const apiCall = isEdit ? patchData : postData;

    apiCall(endpoint, payload, data => {
      toast.success((data as any)?.message);
      navigate(`/customers/${customerId}/assessments`);
    });
  };

  const openTargetModal = () => {
    setIsModalTargetActive(true);
  };

  const handleModalConfirm = () => {
    const payload = {
      ipv4: ipv4.trim(),
      ipv6: ipv6.trim(),
      fqdn: fqdn.trim(),
      name: hostName.trim(),
      customer_id: customerId,
    };

    postData<Target>(`/api/targets`, payload, () => {
      toast.success("Target added successfully");
      setIsModalTargetActive(false);
      setIpv4("");
      setIpv6("");
      setFqdn("");
      setHostName("");
      fetchTargets();
    });
  };

  return (
    <>
      <Modal
        title="New Target"
        confirmButtonLabel="Save"
        isActive={isModalTargetActive}
        onConfirm={handleModalConfirm}
        onCancel={() => setIsModalTargetActive(false)}
      >
        <Grid className="grid-cols-1 gap-4">
          <Input
            type="text"
            id="ipv4"
            label="IPv4"
            placeholder="IPv4 address"
            value={ipv4}
            onChange={e => setIpv4(e.target.value)}
          />
          <Input
            type="text"
            id="ipv6"
            label="IPv6"
            placeholder="IPv6 address"
            value={ipv6}
            onChange={e => setIpv6(e.target.value)}
          />
          <Input
            type="text"
            id="fqdn"
            label="FQDN"
            placeholder="Fully Qualified Domain Name"
            value={fqdn}
            onChange={e => setFqdn(e.target.value)}
          />
          <Input
            type="text"
            id="name"
            label="Name"
            placeholder="This name is used to differentiate between duplicate entries"
            value={hostName}
            onChange={e => setHostName(e.target.value)}
          />
        </Grid>
      </Modal>

      <Card>
        <form onSubmit={handleSubmit}>
          <Grid>
            <h2 className="text-xl font-bold">{isEdit ? "Edit Assessment" : "New Assessment"}</h2>
            <Grid className="grid-cols-2">
              <Input
                type="text"
                label="Name"
                id="name"
                value={form.name}
                onChange={e => handleChange("name", e.target.value)}
                placeholder="Insert a name"
              />
              <SelectWrapper
                label="Assessment Type"
                id="assessment_type"
                options={ASSESSMENT_TYPE}
                value={getOption(ASSESSMENT_TYPE, form.assessment_type.short) || null}
                closeMenuOnSelect
                onChange={option => handleSelectChange("assessment_type", option)}
              />
            </Grid>
            <Grid className="grid-cols-3">
              <DateCalendar
                idStart="start_date_time"
                label="Activity Period"
                isRange
                value={{ start: form.start_date_time, end: form.end_date_time }}
                onChange={val => {
                  const { start, end } = val as { start: string; end: string };
                  handleChange("start_date_time", start);
                  handleChange("end_date_time", end);
                }}
                placeholder={{ start: "Start date", end: "End date" }}
              />
              <DateCalendar
                idStart="kickoff_date_time"
                label="Kick-off date"
                value={{ start: kickoffDate }}
                onChange={val => {
                  if (typeof val === "string") {
                    setKickoffDate(val);
                  }
                }}
              />
              <Grid className="h-full !items-start">
                <Label text="CVSS Versions" />
                <Flex className="gap-4">
                  {CVSS_VERSIONS.map(({ value, label }) => (
                    <Checkbox
                      key={value}
                      id={`cvss_${value}`}
                      label={label}
                      checked={form.cvss_versions[value] || false}
                      onChange={() => toggleCvssVersion(value)}
                    />
                  ))}
                </Flex>
              </Grid>
            </Grid>
            <Grid className="grid-cols-[1fr_auto]">
              <SelectWrapper
                label="Session targets"
                id="targets"
                options={targetOptions}
                isMulti
                value={targetOptions.filter(
                  opt => Array.isArray(form.targets) && form.targets.some(t => t.id === opt.value)
                )}
                onChange={handleTargetsChange}
                closeMenuOnSelect={false}
              />
              <Button icon={mdiPlus} text="New Target" onClick={() => openTargetModal()} />
            </Grid>
            <SelectWrapper
              label="Environment"
              id="environment"
              options={ENVIRONMENT}
              value={form.environment}
              closeMenuOnSelect
              onChange={option => handleSelectChange("environment", option)}
            />
            <SelectWrapper
              label="Testing type"
              id="testing_type"
              options={TESTING_TYPE}
              value={getOption(TESTING_TYPE, form.testing_type) || null}
              closeMenuOnSelect
              onChange={option => handleSelectChange("testing_type", option)}
            />
            <SelectWrapper
              label="OSSTMM Vector"
              id="osstmm_vector"
              options={OSSTMM_VECTOR}
              value={getOption(OSSTMM_VECTOR, form.osstmm_vector) || null}
              closeMenuOnSelect
              onChange={option => handleSelectChange("osstmm_vector", option)}
            />
            <Divider />
            <Buttons>
              <Button text="Submit" onClick={() => {}} formSubmit />
              <Button variant="outline-only" text="Cancel" onClick={() => navigate(-1)} />
            </Buttons>
          </Grid>
        </form>
      </Card>
    </>
  );
}
