# Usage Guide

This comprehensive guide walks you through using Kryvea for managing security assessments.

## Table of Contents

- [Getting Started](#getting-started)
- [User Roles](#user-roles)
- [Workflow Overview](#workflow-overview)
- [Customer Management](#customer-management)
- [Assessment Management](#assessment-management)
- [Vulnerability Management](#vulnerability-management)
- [Category Management](#category-management)
- [Report Generation](#report-generation)
- [Import & Export](#import-export)
- [Keyboard Shortcuts](#keyboard-shortcuts)

## Getting Started

### First Login

1. Navigate to `https://localhost` (or your configured domain)
2. Enter default credentials:
   - **Username**: `kryvea`
   - **Password**: `kryveapassword`
3. When prompted, enter a new password that meets the following requirements:
   - At least 10 characters long
   - Includes at least one uppercase letter
   - Includes at least one lowercase letter
   - Includes at least one special symbol

## User Roles

Kryvea has two user roles:

### Admin

- Full access to all features
- Customer management (create, edit, delete)
- User management
- Category management
- Global template management
- System settings and logs

### User

- Assessment management
- Vulnerability tracking
- Report generation
- Limited to assigned customers
- Cannot manage users or global settings

## Workflow Overview

The typical Kryvea workflow:

::: tip

- Create or import categories from [here](https://github.com/Alexius22/kryvea/blob/main/app/data/generic_categories.json)
- Upload a template report from [here](https://github.com/Alexius22/kryvea/blob/main/app/data/report-template-example.docx)
  :::

### Normal workflow

1. Create Customer
2. Create Assessment
3. Add Vulnerabilities (Manual or Import)
4. Assign Categories & CVSS Scores
5. Add PoC
6. Generate report (DOCX/XLSX)

## Customer Management

### Creating a Customer

**Admin only**

1. Navigate to **Customers** -> **New Customer**
2. Fill in customer details:
   - **Company Name**: Customer organization name
   - **Language**: Default language that will be preselected in new assessment
   - **Logo**: Upload customer logo (PNG, JPG) (Optional)

### Uploading Custom Templates

1. Go to **Edit Customer** page
2. Insert a template name
3. Insert a type to help you to identify better the template (Optional)
4. Select a DOCX/XLSX template file
5. Click **Upload**

### Managing Customers

**View all customers:**

- Navigate to **Customers**
- Search by name
- Click on a customer to view assessments associated

**Edit customer:**

- Customer Detail -> **Edit**
- Update name, language, or logo
- Save changes

**Delete customer:**

- Customer Detail -> **Delete**
- ⚠️ **Warning**: This will delete all associated assessments, targets and vulnerabilities

## Assessment Management

### Creating an Assessment

![New Assessment](/images/new_assessment.png)

1. Navigate to **Customer Detail** -> **Assessments** -> **New Assessment**

2. Fill in assessment information:

   **Basic Information:**

   - **Name**: Assessment name
   - **Assessment Type**: Select assessment type (e.g., Web Application Penetration Test, Network Penetration Test, etc)
   - **Language**: Select assessment language

   **Timeline:**

   - **Start Date**: Testing begins
   - **End Date**: Testing completes
   - **Kickoff Date**: Project start

   **Targets:**

   - Add target systems/applications
   - Each target can have vulnerabilities associated

   **Configuration:**

   - **CVSS Versions**: Select which CVSS versions to use (v3.1, v4.0c)
   - **Environment**: Production | Pre-Production | Testing (Optional)
   - **Testing Type**: Black box | Grey box | White box (Optional)
   - **OSSTMM Vector**: OSSTMM classification (Optional)

### Managing Assessments

**View assessments:**

- Customer name -> **Assessments** tab

::: tip

**Take ownership** ⭐: Once you take ownership of the assessment, it will become accessible on the Dashboard page.
:::

**Edit assessment:**

- Assessment -> **Edit**
- Update any field
- Save changes

**Clone assessment:**

- Assessment -> **Clone**
- Optionally include PoCs
- Creates duplicate with all vulnerabilities

**Delete assessment:**

- Assessment -> **Delete**
- ⚠️ **Warning**: Deletes all associated vulnerabilities

### Assessment Status Workflow

```
On Hold -> In Progress -> Completed
```

Update status from the assessments page.

## Vulnerability Management

### Adding Vulnerabilities Manually

![New Vulnerability](/images/new_vulnerability.png)

1. Navigate to **Assessment** -> **Vulnerabilities** -> **New Vulnerability**

2. Select a **Category** (e.g., "SQL Injection", "XSS")

   - Generic description auto-populated from categories
   - Ticking the "Show categories from all sources" checkbox will include categories created during automatic scans (e.g. Nessus, Burp) among the selectable categories
   - Ticking the "Generic remediation" checkbox will add the remediation included in the category; leaving this box unticked will prevent it from being included

3. Fill in details:

   - **Detailed Title**: Specific vulnerability name (Optional)
   - **Status**: Open | Fixed | Partially Fixed
   - **Target**: Affected target

4. **CVSS Scoring**:

   - Select CVSS version (based on assessment config)
   - Use the calculator or enter vector string
   - Score auto-calculated

5. **Description & Remediation**:

   - Write details to specifically describe the identified vulnerability
   - If necessary, include a more specific remediation

6. **References**:

   - Add URLs, CVE IDs, etc. (One per line)

### CVSS Calculator

The built-in CVSS calculator supports:

- **CVSS v3.1**: Base, Temporal, Environmental
- **CVSS v4**: Base, Supplemental, Environmental, Threat metrics

**Usage:**

1. Select CVSS version
2. Choose values for each metric
3. Vector string and score auto-generate
4. Severity level displayed (None, Low, Medium, High, Critical)

### Adding Proof of Concept (PoC)

![Edit PoC](/images/edit_poc.png)

1. Navigate to **Vulnerability Detail** -> **Edit PoC** tab
2. Use the header bar to add:
   - HTTP Request/Response
   - Image
   - Text
3. Add highlighting to Request/Response and Text to highlight specific snippets
4. Click **Save**

### Searching Vulnerabilities

![Vulnerability Search](/images/vulnerability_search.png)

**Global search:**

- Navigate to **Vulnerability Search**
- Search across all assessments
- Filter by:
  - Assessment
  - User
  - Date range
  - Customer
  - CVSS Versions
  - CVSS score range

### Copying Vulnerabilities

Copy vulnerabilities between assessments:

1. Find vulnerability in search
2. Click **Copy to**
3. Select destination:
   - Customer
   - Assessment
   - Target
4. Optionally include PoC
5. Click **Copy**

## Category Management

**Admin only**

Categories define vulnerability types using generic descriptions and remediation guidance, with support for multiple languages.

### Browsing Categories

- Navigate to **Categories**
- View all available categories
- It can be preloaded with some items from the OWASP Top 10, which can be found [here](https://github.com/Alexius22/kryvea/blob/main/app/data/generic_categories.json)

### Creating a Category

1. **Categories** -> **New Category**

2. Fill in details:

   - **Identifier**: Short code (e.g., "A01:2021")
   - **Name**: Vulnerability type (e.g., "SQL Injection")
   - **Source**:
     - OWASP Top 10 Web
     - OWASP Top 10 Mobile
     - OWASP Top 10 API
     - OWASP Top 10 for LLM
     - ATT&CK
     - Burp
     - CWE
     - Nessus
   - **References**: Links to CWE, OWASP, etc.

3. **Generic Description** and **Generic Remediation** (multilingual), it is set by default to the language selected in the `Settings`, but any language can be added.

### Importing Categories

1. **Categories** -> **Import**
2. Select JSON file with category definitions (e.g., `app/data/generic_categories.json`)
3. Choose import mode:
   - **Add new only**: Skip existing
   - **Override**: Update existing categories
4. Click **Import**

### Exporting Categories

1. **Categories** -> **Export**
2. Downloads JSON file with all categories
3. Share with team or backup

## Report Generation

### Generating DOCX Reports

1. Navigate to **Assessment Detail**
2. Click **Export** -> **DOCX**
3. Select template:
   - Global template
   - Customer-specific template
4. Configure options:
   - Include informational findings
5. Click **Generate**
6. Download Word document

### Generating XLSX Reports

1. Navigate to **Assessment Detail**
2. Click **Export** -> **XLSX**
3. Select template:
   - Global template
   - Customer-specific template
4. Configure options:
   - Include informational findings
5. Click **Generate**
6. Download Excel document

### Generating XLSX Reports with images with ZIP

1. Navigate to **Assessment Detail**
2. Click **Export** -> **ZIP**
3. Configure options:
   - Include informational findings
4. Click **Generate**
5. Download zip archive that contains a xlsx file and a folder with images

## Import & Export

### Importing from Burp Suite

1. In Burp Suite:

   - Scanner -> Right-click -> **Save selected issues**
   - Choose XML format

2. In Kryvea:
   - Assessment -> **Import** -> **Burp Suite**
   - Upload XML file
   - Map to targets
   - Vulnerabilities auto-created with CVSS scores

### Importing from Nessus

1. In Nessus:

   - Export scan results
   - Choose Nessus format (.nessus)

2. In Kryvea:
   - Assessment -> **Import** -> **Nessus**
   - Upload .nessus file
   - Map plugins to categories
   - Vulnerabilities auto-created

### Category Import/Export

**Export:**

- Categories -> **Export**
- Save JSON file

**Import:**

- Categories -> **Import**
- Upload JSON file
- Choose override option

## Keyboard Shortcuts

### Edit PoC

- In MonacoEditor you have all the VS Code shortcuts
- `Ctrl/Cmd + V`: Paste image in PoC image type

## Next Steps

- **[Templating Guide](/templating)** - Create custom report templates
- **[Troubleshooting](troubleshooting)** - Common issues
