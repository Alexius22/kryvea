export type ObjectKey = string | number | symbol;

export type Vulnerability = {
  id: string;
  updated_at: string;
  category: { id: string; index: string; name: string };
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
  target: { id: string; ipv4: string; ipv6: string; fqdn: string };
  assessment: { id: string; name: string };
  user: { id: string; username: string };
};

export type User = {
  id: string;
  disabled_at: string;
  username: string;
  role: string;
  customers: [{ id: string; name: string }];
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
  customer: { id: string; name: string };
  is_owned: boolean;
};

export type Host = {
  id: string;
  ipv4: string;
  ipv6: string;
  port: number;
  protocol: string;
  fqdn: string;
  name: string;
  customer: { id: string; name: string };
};

export type Customer = {
  id: string;
  name: string;
  language: string;
  default_cvss_versions: string[];
  updated_at: Date;
  created_at: Date;
};

export type Category = {
  id?: string;
  index: string;
  name: string;
  generic_description: Record<string, string>;
  generic_remediation: Record<string, string>;
  references: string[];
};

export type Poc = {
  id: string;
  index: number;
  type: string;
  description: string;
  uri: string;
  request: string;
  response: string;
  image_id: string;
  image_data: string;
  image_caption: string;
  text_language: string;
  text_data: string;
  vulnerability_id: string;
};
