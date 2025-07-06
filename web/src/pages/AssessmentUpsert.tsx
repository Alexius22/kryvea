import { mdiPlus } from "@mdi/js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { getData, patchData, postData } from "../api/api";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Checkbox from "../components/Form/Checkbox";
import Input from "../components/Form/Input";
import Label from "../components/Form/Label";
import SelectWrapper from "../components/Form/SelectWrapper";
import { SelectOption } from "../components/Form/SelectWrapper.types";
import { getPageTitle } from "../config";
import { Assessment, Target } from "../types/common.types";

const ASSESSMENT_TYPE: SelectOption[] = [
  { value: "VAPT", label: "Vulnerability Assessment Penetration Test" },
  { value: "WAPT", label: "Web Application Penetration Test" },
  { value: "MAPT", label: "Mobile Application Penetration Test" },
  { value: "NPT", label: "Network Penetration Test" },
  { value: "Red Team Assessment", label: "Red Team Assessment" },
  { value: "IoT", label: "IoT" },
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

  const [form, setForm] = useState<
    Omit<Assessment, "id" | "created_at" | "updated_at" | "status" | "vulnerability_count" | "customer" | "is_owned">
  >({
    assessment_type: "",
    name: "",
    start_date_time: "",
    end_date_time: "",
    targets: [],
    cvss_versions: [],
    environment: "",
    testing_type: "",
    osstmm_vector: "",
  });

  const [assessment, setAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    document.title = getPageTitle(isEdit ? "Edit Assessment" : "Add Assessment");
    getData<Target[]>(`/api/customers/${customerId}/targets`, setTargets);

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
            targets: data.targets,
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
        ? `${target.fqdn} - ${target.ipv4 || target.ipv6}`
        : target.fqdn || target.ipv4 || target.ipv6,
  }));

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSelectChange = (field: keyof typeof form, option: SelectOption | null) => {
    handleChange(field, option ? option.value : "");
  };

  const toggleCvssVersion = (version: string) => {
    setForm(prev => {
      const current = prev.cvss_versions;
      if (current.includes(version)) {
        return {
          ...prev,
          cvss_versions: current.filter(v => v !== version),
        };
      } else {
        return {
          ...prev,
          cvss_versions: [...current, version],
        };
      }
    });
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

    apiCall(endpoint, payload, () => {
      navigate(`/customers/${customerId}/assessments`);
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Grid>
          <h2 className="text-xl font-bold">{isEdit ? "Edit Assessment" : "New Assessment"}</h2>
          <SelectWrapper
            label="Assessment Type"
            id="assessment_type"
            options={ASSESSMENT_TYPE}
            value={getOption(ASSESSMENT_TYPE, form.assessment_type) || null}
            closeMenuOnSelect
            onChange={option => handleSelectChange("assessment_type", option)}
          />
          <Input
            type="text"
            label="Name"
            id="name"
            value={form.name}
            onChange={e => handleChange("name", e.target.value)}
            placeholder="Insert a name"
          />
          <Grid className="grid-cols-2 gap-4">
            <Input
              type="date"
              label="Activity period"
              id="start_date_time"
              value={form.start_date_time.slice(0, 10)}
              onChange={e => handleChange("start_date_time", e.target.value)}
            />
            <Input
              type="date"
              id="end_date_time"
              value={form.end_date_time.slice(0, 10)}
              onChange={e => handleChange("end_date_time", e.target.value)}
            />
          </Grid>
          <Grid className="grid-cols-[1fr_auto]">
            <SelectWrapper
              label="Session targets"
              id="targets"
              options={targetOptions}
              isMulti
              value={targetOptions.filter(opt => form.targets.some(t => t.id === opt.value))}
              onChange={handleTargetsChange}
              closeMenuOnSelect={false}
            />
            <Button
              className="h-[42px]"
              icon={mdiPlus}
              text="New Target"
              onClick={() => navigate(`/customers/${customerId}/targets/new`)}
            />
          </Grid>
          <Grid>
            <Label text="CVSS Versions" />
            {CVSS_VERSIONS.map(({ value, label }) => (
              <Checkbox
                key={value}
                id={`cvss_${value}`}
                htmlFor={`cvss_${value}`}
                label={label}
                checked={form.cvss_versions.includes(value)}
                onChange={() => toggleCvssVersion(value)}
              />
            ))}
          </Grid>
          <SelectWrapper
            label="Environment"
            id="environment"
            options={ENVIRONMENT}
            value={getOption(ENVIRONMENT, form.environment) || null}
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
  );
}
