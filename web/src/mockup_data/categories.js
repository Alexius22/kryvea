export const categories = [
  {
    "id": "64b9b35b8f8e4b7a84c7f2f0",
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-12-10T14:00:00Z",
    "index": "C-001",
    "name": "SQL Injection",
    "generic_description": "An SQL injection vulnerability allows attackers to execute arbitrary SQL commands on a database.",
    "generic_remediation": "Use parameterized queries or prepared statements to prevent malicious input."
  },
  {
    "id": "64b9b35b8f8e4b7a84c7f2f1",
    "created_at": "2023-02-10T09:30:00Z",
    "updated_at": "2023-12-15T16:00:00Z",
    "index": "C-002",
    "name": "Cross-Site Scripting (XSS)",
    "generic_description": "An XSS vulnerability allows attackers to inject malicious scripts into web pages viewed by other users.",
    "generic_remediation": "Sanitize user inputs and use content security policies to mitigate risks."
  },
  {
    "id": "64b9b35b8f8e4b7a84c7f2f2",
    "created_at": "2023-03-05T14:15:00Z",
    "updated_at": "2023-12-20T13:45:00Z",
    "index": "C-003",
    "name": "Broken Authentication",
    "generic_description": "Broken authentication vulnerabilities allow attackers to compromise user identities.",
    "generic_remediation": "Implement strong password policies, multi-factor authentication, and proper session management."
  },
  {
    "id": "64b9b35b8f8e4b7a84c7f2f3",
    "created_at": "2023-04-20T11:00:00Z",
    "updated_at": "2023-12-25T11:30:00Z",
    "index": "C-004",
    "name": "Insecure Direct Object References (IDOR)",
    "generic_description": "IDOR vulnerabilities allow attackers to access resources without proper authorization.",
    "generic_remediation": "Perform authorization checks for every request and avoid exposing internal object identifiers."
  },
  {
    "id": "64b9b35b8f8e4b7a84c7f2f4",
    "created_at": "2023-05-10T08:45:00Z",
    "updated_at": "2023-12-30T12:15:00Z",
    "index": "C-005",
    "name": "Directory Traversal",
    "generic_description": "Directory traversal vulnerabilities allow attackers to access restricted files and directories.",
    "generic_remediation": "Validate and sanitize file paths and use proper file access permissions."
  }
]