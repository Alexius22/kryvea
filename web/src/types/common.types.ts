export type ObjectKey = string | number | symbol;

export type ObjectWithId = {
  id: string;
  [k: ObjectKey]: any;
};

export type Vulnerability = {
  id: string;
  updated_at: string;
  category: { id: string; index: string; name: string; source: Category["source"] };
  detailed_title: string;
  cvssv2: {
    cvss_version: string;
    cvss_vector: string;
    cvss_score: number;
    cvss_severity: string;
    cvss_description: string;
  };
  cvssv3: {
    cvss_version: string;
    cvss_vector: string;
    cvss_score: number;
    cvss_severity: string;
    cvss_description: string;
  };
  cvssv31: {
    cvss_version: string;
    cvss_vector: string;
    cvss_score: number;
    cvss_severity: string;
    cvss_description: string;
  };
  cvssv4: {
    cvss_version: string;
    cvss_vector: string;
    cvss_score: number;
    cvss_severity: string;
    cvss_description: string;
  };
  references: string[];
  generic_description: { enabled: boolean; text: string };
  generic_remediation: { enabled: boolean; text: string };
  description: string;
  remediation: string;
  target: { id: string; ipv4: string; ipv6: string; fqdn: string; name: string; customer: Customer };
  assessment: { id: string; name: string };
  user: { id: string; username: string };
};

export type User = {
  id: string;
  disabled_at: string;
  username: string;
  role: string;
  customers: Customer[];
  assessments: { id: string; name: string };
};

export type Assessment = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  start_date_time: string;
  end_date_time: string;
  targets: { id: string; ipv4: string; ipv6: string; fqdn: string }[];
  status: string;
  assessment_type: string;
  cvss_versions: string[];
  environment: string;
  testing_type: string;
  osstmm_vector: string;
  vulnerability_count: number;
  customer: Customer;
  is_owned: boolean;
};

export type Target = {
  id: string;
  ipv4: string;
  ipv6: string;
  port: number;
  protocol: string;
  fqdn: string;
  name: string;
  customer: Customer;
};

export type Customer = {
  id: string;
  name: string;
  language: string;
  updated_at: Date;
  created_at: Date;
  templates: Template[];
};

export type Category = {
  id: string;
  index: string;
  name: string;
  source: "generic" | "nessus" | "burp";
  generic_description: Record<string, string>;
  generic_remediation: Record<string, string>;
  references: string[];
};

export type Template = {
  id: string;
  name: string;
  filename: string;
  language: string;
  type: string;
  file_type: string;
  file_id: string;
  customer: Customer;
};

export const ASSESSMENT_TYPE = [
  { value: "VAPT", label: "Vulnerability Assessment Penetration Test" },
  { value: "WAPT", label: "Web Application Penetration Test" },
  { value: "API PT", label: "API Penetration Test" },
  { value: "MAPT", label: "Mobile Application Penetration Test" },
  { value: "NPT", label: "Network Penetration Test" },
  { value: "Red Team Assessment", label: "Red Team Assessment" },
  { value: "IoT PT", label: "IoT Device Penetration Test" },
];

export const uuidZero = "00000000-0000-0000-0000-000000000000";
