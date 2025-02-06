export type ObjectKey = string | number | symbol;

export type Vulnerability = {
    id: string;
    detailed_title: string;
    cvss_score: number;
    cvss_vector: string;
    assessment_id: number;
    target_id: string;
};

export type User = {
    id: string;
    username: string;
    role: string;
    customers: string[];
};

export type Assessment = {
    id: string;
    name: string;
    type: string;
    start_date_time: string;
    end_date_time: string;
    status: string;
    customer_id: string;
    created_at: string;
    updated_at: string;
    notes: string;
    targets: string[];
    cvss_version: number;
    environment: string;
    network: string;
    method: string;
    osstmm_vector: string;
    is_favourite: boolean;
};

export type Host = {
    id: string;
    ip: string;
    hostname: string;
    customer_id: string;
}

export type Customer = {
    id: string;
    name: string;
    language: string;
    default_cvss_version: string;
}

export type Category = {
    id: string;
    index: string;
    name: string;
    generic_description: string;
    generic_remediation: string;
}