import { mdiPlus } from "@mdi/js";
import { useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { getData, patchData, postData } from "../api/api";
import Card from "../components/Composition/Card";
import Divider from "../components/Composition/Divider";
import Flex from "../components/Composition/Flex";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Checkbox from "../components/Form/Checkbox";
import DateCalendar from "../components/Form/DateCalendar";
import Input from "../components/Form/Input";
import Label from "../components/Form/Label";
import SelectWrapper from "../components/Form/SelectWrapper";
import { SelectOption } from "../components/Form/SelectWrapper.types";
import { Assessment, Target } from "../types/common.types";
import { Keys } from "../types/utils.types";
import { getPageTitle } from "../utils/helpers";

type AssessmentPayload = Omit<
  Assessment,
  "id" | "created_at" | "updated_at" | "vulnerability_count" | "customer" | "is_owned"
>;

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
  { value: "Testing", label: "Testing" },
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

const initialSelectedOptionsState: {
  type: SelectOption;
  environment: SelectOption;
  testing_type: SelectOption;
  osstmm_vector: SelectOption;
} = {
  type: undefined,
  environment: undefined,
  testing_type: undefined,
  osstmm_vector: undefined,
};

function reducer(
  state: typeof initialSelectedOptionsState,
  {
    action,
    field,
    value,
  }:
    | { action: "field"; field: Keys<typeof initialSelectedOptionsState>; value: SelectOption }
    | { action: "all"; field: ""; value: AssessmentPayload }
) {
  switch (action) {
    case "field":
      return { ...state, [field]: value };
    case "all":
      return {
        type: { label: value.type.full, value: value.type },
        environment: { label: value.environment, value: value.environment },
        testing_type: { label: value.testing_type, value: value.testing_type },
        osstmm_vector: { label: value.osstmm_vector, value: value.osstmm_vector },
      };
  }
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
  const [tag, setTag] = useState("");
  const [selectedOptions, updateSelectedOptions] = useReducer(reducer, initialSelectedOptionsState);

  const [form, setForm] = useState<AssessmentPayload>({
    type: { short: "", full: "" },
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

  const fetchTargets = (callback?: (targets: Target[]) => void) => {
    getData<Target[]>(`/api/customers/${customerId}/targets`, targets => {
      setTargets(targets);
      if (callback) {
        callback(targets);
      }
    });
  };

  useEffect(() => {
    document.title = getPageTitle(isEdit ? "Edit Assessment" : "Add Assessment");
    fetchTargets();

    if (isEdit) {
      getData<Assessment>(
        `/api/assessments/${assessmentId}`,
        data => {
          setForm({
            type: data.type,
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
          updateSelectedOptions({ action: "all", field: "", value: data });
        },
        err => {
          toast.error(err.response.data.error);
          navigate(`/customers/${customerId}/assessments`);
        }
      );
    }
  }, [isEdit, customerId, assessmentId, navigate]);

  const targetOptions: SelectOption[] = useMemo(
    () =>
      targets.map(target => ({
        value: target.id,
        label:
          target.fqdn && (target.ipv4 || target.ipv6)
            ? `${target.fqdn} - ${target.ipv4 || target.ipv6}${target.tag ? ` (${target.tag})` : ""}`
            : (target.fqdn || target.ipv4 || target.ipv6) + (target.tag ? ` (${target.tag})` : ""),
      })),
    [targets]
  );

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSelectChange = (field: Keys<typeof initialSelectedOptionsState>, option: SelectOption | null) => {
    updateSelectedOptions({ action: "field", field: field, value: option });
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

    if (!form.name) {
      toast.error("Assessment name required");
      return;
    }
    if (!form.type.full || !form.type.short) {
      toast.error("Assessment type required");
      return;
    }
    if (Object.values(form.cvss_versions).every(val => val === false)) {
      toast.error("Select at least one CVSS version");
      return;
    }
    if (form.targets.length === 0) {
      toast.error("At least a target is required");
      return;
    }

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
      tag: tag.trim(),
      customer_id: customerId,
    };

    postData<{ message: string; target_id: string }>("/api/targets", payload, data => {
      toast.success(data.message);
      setIsModalTargetActive(false);
      setIpv4("");
      setIpv6("");
      setFqdn("");
      setTag("");

      fetchTargets(newTargets => {
        // Find the new one and preselect it
        const newTarget = newTargets.find(t => t.id === data.target_id);
        if (newTarget) {
          setForm(prev => ({
            ...prev,
            targets: [...prev.targets, newTarget],
          }));
        }
      });
    });
  };

  return (
    <>
      {isModalTargetActive && (
        <Modal
          title="New Target"
          confirmButtonLabel="Save"
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
              label="FQDN | Target name"
              placeholder="Fully Qualified Domain Name or target name"
              value={fqdn}
              onChange={e => setFqdn(e.target.value)}
            />
            <Input
              type="text"
              id="tag"
              label="Tag"
              placeholder="This value is used to differentiate between duplicate entries"
              value={tag}
              onChange={e => setTag(e.target.value)}
            />
          </Grid>
        </Modal>
      )}

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
                id="type"
                options={ASSESSMENT_TYPE}
                value={selectedOptions.type}
                closeMenuOnSelect
                onChange={option => handleSelectChange("type", option)}
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
              <Button icon={mdiPlus} text="New Target" onClick={openTargetModal} />
            </Grid>
            <SelectWrapper
              label="Environment"
              id="environment"
              options={ENVIRONMENT}
              value={selectedOptions.environment}
              closeMenuOnSelect
              onChange={option => handleSelectChange("environment", option)}
            />
            <SelectWrapper
              label="Testing type"
              id="testing_type"
              options={TESTING_TYPE}
              value={selectedOptions.testing_type}
              closeMenuOnSelect
              onChange={option => handleSelectChange("testing_type", option)}
            />
            <SelectWrapper
              label="OSSTMM Vector"
              id="osstmm_vector"
              options={OSSTMM_VECTOR}
              value={selectedOptions.osstmm_vector}
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
