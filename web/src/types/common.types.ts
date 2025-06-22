export type ObjectKey = string | number | symbol;

export type Vulnerability = {
  updated_at: string;
  category: { id: string; name: string };
  detailed_title: string;
  cvss_vector: string;
  cvss_score: number;
  cvss_severity: string;
  cvss_description: string;
  references: string[];
  generic_description: { enabled: boolean; text: string };
  generic_remediation: { enabled: boolean; text: string };
  description: string;
  remediation: string;
  target: { id: string; ip: string; hostname: string };
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
  targets: { id: string; ip: string; hostname: string }[];
  status: string;
  assessment_type: string;
  cvss_version: string;
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
  customer: { id: string; name: string; };
};

export type Customer = {
  id: string;
  name: string;
  language: string;
  default_cvss_version: string;
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
