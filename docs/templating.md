# Templating Guide

Learn how to create custom report templates for Kryvea using DOCX files with dynamic placeholders. The report generation relies on the [go-template-docx](https://github.com/JJJJJJack/go-template-docx) library, which is built upon Go's standard [text/template](http://pkg.go.dev/text/template) package. If you want to try a ready-to-use template, you can use [this](https://github.com/Alexius22/kryvea/blob/main/app/data/report-template-example.docx).

## Table of Contents

- [Overview](#overview)
- [Template Variables](#template-variables)
- [Creating Templates](#creating-templates)
- [Template Functions](#template-functions)
- [Examples](#examples)
- [Testing Templates](#testing-templates)

## Overview

Kryvea uses Go template syntax within DOCX files to generate dynamic reports. Templates support:

- Variable substitution
- Conditional logic
- Loops for vulnerabilities

## Template Variables

### Customer Variables

::: v-pre

```
{{.Customer.Name}}             # Customer name
{{.Customer.Language}}         # Customer language (en/it)
{{.Customer.LogoReference}}    # Logo image path
```

:::

### Assessment Variables

::: v-pre

```
{{.Assessment.Name}}                    # Assessment name
{{.Assessment.Type.Short}}              # Type short name (VAPT, MAPT)
{{.Assessment.Type.Full}}               # Type full name
{{.Assessment.Language}}                # Report language
{{.Assessment.StartDateTime}}           # Start date/time
{{.Assessment.EndDateTime}}             # End date/time
{{.Assessment.KickoffDateTime}}         # Kickoff date/time
{{.Assessment.Status}}                  # Status (On Hold, In Progress, Completed)
{{.Assessment.Environment}}             # Environment
{{.Assessment.TestingType}}             # Testing type
{{.Assessment.OSSTMMVector}}            # OSSTMM vector
{{.Assessment.VulnerabilityCount}}      # Total vulnerabilities
```

:::

### Vulnerability Loop

::: v-pre

```
{{range .Vulnerabilities}}
  {{.Category.Name}}            # Category name
  {{.DetailedTitle}}            # Vulnerability title
  {{.Status}}                   # Status
  {{.GenericDescription.Text}}  # Category vulnerability description
  {{.Description}}              # Description
  {{.GenericRemediation.Text}}  # Category vulnerability remediation
  {{.Remediation}}              # Remediation
  {{.Target.FQDN}}              # Target name
  {{.Target.IPv4}}              # Target IPv4

  # CVSS Scores
  {{.CVSSv31.Score}}          # CVSS v3.1 score
  {{.CVSSv31.Vector}}         # CVSS v3.1 vector
  {{.CVSSv31.Severity.Label}} # Severity label

  {{.CVSSv4.Score}}           # CVSS v4.0 score
  {{.CVSSv4.Vector}}          # CVSS v4.0 vector
  {{.CVSSv4.Severity.Label}}  # Severity label

  # PoCs
  {{range .Poc.Pocs}}
    # Request/Response
    {{.Description}}
    {{range .RequestHighlighted}}     # HTTP request highlighted
      {{preserveNewline (shadeTextBg .Text .Color)}}
    {{end}}
    {{range .ResponseHighlighted}}    # HTTP response highlighted
      {{preserveNewline (shadeTextBg .Text .Color)}}
    {{end}}

    # Image
    {{image .ImageReference}}         # Image
    {{.ImageCaption}}                 # Image caption

    # Text
    {{range .TextHighlighted}}        # Text highlighted
      {{preserveNewline (shadeTextBg .Text .Color)}}
    {{end}}
  {{end}}

  # References
  {{range .Category.References}}
    {{.}}                             # Category References
  {{end}}
  {{range .References}}
    {{.}}                             # Each reference
  {{end}}
{{end}}
```

:::

## Creating Templates

### Step 1: Create Base DOCX

1. Open Microsoft Word
2. Design your report layout
3. Add customer branding placeholders
4. Style headings, tables, etc.

### Step 2: Add Placeholders

Insert template variables in double curly braces:

::: v-pre

```
Assessment Name: {{.Assessment.Name}}
Customer: {{.Customer.Name}}
Date: {{formatDate .Assessment.StartDateTime}}
```

:::

### Step 3: Add Vulnerability Loop

For vulnerability listings:

::: v-pre

```
{{range .Vulnerabilities}}

Title: {{.DetailedTitle}}
Severity: {{.CVSSv31.Severity.Label}}
Score: {{.CVSSv31.Score}}

Description:
{{.Description}}

Remediation:
{{.Remediation}}

{{end}}
```

:::

### Step 4: Upload Template

**Global template (Admin):**

- Navigate to Templates -> Upload
- Select DOCX or XLSX file

**Customer template:**

- Navigate to Customer -> Upload Template
- Select DOCX or XLSX file

## Template Functions

### Date Formatting

::: v-pre

```
{{formatDate .Assessment.StartDateTime}}
# Output: DD/MM/YYYY

{{formatDateTime .Assessment.StartDateTime "UTC" "US}}
# Output: MM/DD/YYYY

{{formatTime .Assessment.StartDateTime "UTC" "ISO"}}
# Output: YYYY-MM-DD
```

:::

### Conditionals

::: v-pre

```
{{if .Assessment.OSSTMMVector}}
  OSSTMM Vector: {{.Assessment.OSSTMMVector}}
{{end}}

{{if eq .Assessment.Status "Completed"}}
  This assessment is complete.
{{else}}
  This assessment is ongoing.
{{end}}
```

:::

### Filtering Vulnerabilities

::: v-pre

```
{{range .Vulnerabilities}}
  {{if eq .Status "Open"}}
    # Only show open vulnerabilities
    Title: {{.DetailedTitle}}
  {{end}}
{{end}}
```

:::

## Examples

### Executive Summary Template

::: v-pre

```
EXECUTIVE SUMMARY

Client: {{.Customer.Name}}
Assessment: {{.Assessment.Name}}
Period: {{formatDate .Assessment.StartDateTime}} - {{formatDate .Assessment.EndDateTime}}
Status: {{.Assessment.Status}}

Total Findings: {{.Assessment.VulnerabilityCount}}
```

:::

### Detailed Findings Template

::: v-pre

```
DETAILED FINDINGS

{{range $index, $vuln := .Vulnerabilities}}

{{$vuln.DetailedTitle}}

Category: {{$vuln.Category.Name}}
Severity: {{$vuln.CVSSv31.Severity}}
CVSSv3.1 Score: {{$vuln.CVSSv31.Score}}
CVSSv3.1 Vector: {{$vuln.CVSSv31.Vector}}
CVSSv4.0 Score: {{$vuln.CVSSv4.Score}}
CVSSv4.0 Vector: {{$vuln.CVSSv4.Vector}}
Status: {{$vuln.Status}}
Affected Target: {{$vuln.Target.FQDN}}

Description:
{{breakParagraph $vuln.Description}}

{{range $vuln.Poc.Pocs}}{{if eq .Type "request/response"}}
{{preserveNewline .Description}}
{{.URI}}
HTTP Request
{{range .RequestHighlighted}}{{preserveNewline (shadeTextBg .Text .Color)}}{{end}}
HTTP Response
{{range .ResponseHighlighted}}{{preserveNewline (shadeTextBg .Text .Color)}}{{end}}

{{end}}{{if eq .Type "image"}}
{{preserveNewline .Description}}
{{.URI}}
{{image .ImageReference}}
Figure 1 - {{.ImageCaption}}

{{end}}{{if eq .Type "text"}}
{{preserveNewline .Description}}
{{.URI}}
{{range .TextHighlighted}}{{preserveNewline (shadeTextBg .Text .Color)}}{{end}}
{{end}}{{end}}

Remediation:
{{breakParagraph $vuln.GenericRemediation.Text}} {{breakParagraph $vuln.Remediation}}
References:
{{range .Category.References}}{{.}}
{{end}}{{range .References}}{{.}}
{{end}} 
{{end}}
```

:::

### Cover Page Template

::: v-pre

```
{{.Customer.LogoReference}}   # Insert customer logo

{{.Assessment.Type.Full}} Report

{{.Customer.Name}}

Assessment Period:
{{formatDate .Assessment.StartDateTime}} to
{{formatDate .Assessment.EndDateTime}}

Prepared by: [Your Company Name]
Date: {{formatDate .DeliveryDateTime}}
Status: {{.Assessment.Status}}
```

:::

## Troubleshooting Templates

### Template Rendering Fails

**Error:** "Template execution failed"

**Solutions:**

- Check for unclosed tags: <code v-pre>{{range}}</code> and <code v-pre>{{if}}</code> needs <code v-pre>{{end}}</code>
- Verify variable names match exactly
- Remove special characters from Word formatting
- Save as .docx, not .doc

### Formatting Issues

**Error:** Output formatting is broken

**Solutions:**

- Keep template syntax on single lines
- Don't split <code v-pre>{{</code> <code v-pre>}}</code> across paragraphs

## Next Steps

- **[Usage Guide](/usage)** - Learn the workflow
