import{_ as l,c as i,o as t,ah as a,j as e,a as s}from"./chunks/framework.Du42VF1p.js";const m=JSON.parse('{"title":"Templating Guide","description":"","frontmatter":{},"headers":[],"relativePath":"templating.md","filePath":"templating.md"}'),p={name:"templating.md"};function r(o,n,c,u,d,h){return t(),i("div",null,[...n[0]||(n[0]=[a("",9),e("div",null,[e("div",{class:"language-"},[e("button",{title:"Copy Code",class:"copy"}),e("span",{class:"lang"}),e("pre",{class:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabindex:"0",dir:"ltr","v-pre":""},[e("code",null,[e("span",{class:"line"},[e("span",null,"{{.Customer.Name}}             # Customer name")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Customer.Language}}         # Customer language (en/it)")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Customer.LogoReference}}    # Logo image path")])])])])],-1),e("h3",{id:"assessment-variables",tabindex:"-1"},[s("Assessment Variables "),e("a",{class:"header-anchor",href:"#assessment-variables","aria-label":"Permalink to “Assessment Variables”"},"​")],-1),e("div",null,[e("div",{class:"language-"},[e("button",{title:"Copy Code",class:"copy"}),e("span",{class:"lang"}),e("pre",{class:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabindex:"0",dir:"ltr","v-pre":""},[e("code",null,[e("span",{class:"line"},[e("span",null,"{{.Assessment.Name}}                    # Assessment name")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Assessment.Type.Short}}              # Type short name (VAPT, MAPT)")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Assessment.Type.Full}}               # Type full name")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Assessment.Language}}                # Report language")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Assessment.StartDateTime}}           # Start date/time")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Assessment.EndDateTime}}             # End date/time")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Assessment.KickoffDateTime}}         # Kickoff date/time")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Assessment.Status}}                  # Status (On Hold, In Progress, Completed)")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Assessment.Environment}}             # Environment")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Assessment.TestingType}}             # Testing type")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Assessment.OSSTMMVector}}            # OSSTMM vector")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Assessment.VulnerabilityCount}}      # Total vulnerabilities")])])])])],-1),e("h3",{id:"vulnerability-loop",tabindex:"-1"},[s("Vulnerability Loop "),e("a",{class:"header-anchor",href:"#vulnerability-loop","aria-label":"Permalink to “Vulnerability Loop”"},"​")],-1),e("div",null,[e("div",{class:"language-"},[e("button",{title:"Copy Code",class:"copy"}),e("span",{class:"lang"}),e("pre",{class:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabindex:"0",dir:"ltr","v-pre":""},[e("code",null,[e("span",{class:"line"},[e("span",null,"{{range .Vulnerabilities}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{.Category.Name}}            # Category name")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{.DetailedTitle}}            # Vulnerability title")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{.Status}}                   # Status")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{.GenericDescription.Text}}  # Category vulnerability description")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{.Description}}              # Description")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{.GenericRemediation.Text}}  # Category vulnerability remediation")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{.Remediation}}              # Remediation")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{.Target.FQDN}}              # Target name")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{.Target.IPv4}}              # Target IPv4")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"  # CVSS Scores")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{.CVSSv31.Score}}          # CVSS v3.1 score")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{.CVSSv31.Vector}}         # CVSS v3.1 vector")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{.CVSSv31.Severity.Label}} # Severity label")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{.CVSSv4.Score}}           # CVSS v4.0 score")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{.CVSSv4.Vector}}          # CVSS v4.0 vector")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{.CVSSv4.Severity.Label}}  # Severity label")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"  # PoCs")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{range .Poc.Pocs}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"    # Request/Response")]),s(`
`),e("span",{class:"line"},[e("span",null,"    {{.Description}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"    {{range .RequestHighlighted}}     # HTTP request highlighted")]),s(`
`),e("span",{class:"line"},[e("span",null,"      {{preserveNewline (shadeTextBg .Text .Color)}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"    {{end}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"    {{range .ResponseHighlighted}}    # HTTP response highlighted")]),s(`
`),e("span",{class:"line"},[e("span",null,"      {{preserveNewline (shadeTextBg .Text .Color)}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"    {{end}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"    # Image")]),s(`
`),e("span",{class:"line"},[e("span",null,"    {{image .ImageReference}}         # Image")]),s(`
`),e("span",{class:"line"},[e("span",null,"    {{.ImageCaption}}                 # Image caption")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"    # Text")]),s(`
`),e("span",{class:"line"},[e("span",null,"    {{range .TextHighlighted}}        # Text highlighted")]),s(`
`),e("span",{class:"line"},[e("span",null,"      {{preserveNewline (shadeTextBg .Text .Color)}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"    {{end}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{end}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"  # References")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{range .Category.References}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"    {{.}}                             # Category References")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{end}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{range .References}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"    {{.}}                             # Each reference")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{end}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{end}}")])])])])],-1),a("",5),e("div",null,[e("div",{class:"language-"},[e("button",{title:"Copy Code",class:"copy"}),e("span",{class:"lang"}),e("pre",{class:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabindex:"0",dir:"ltr","v-pre":""},[e("code",null,[e("span",{class:"line"},[e("span",null,"Assessment Name: {{.Assessment.Name}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"Customer: {{.Customer.Name}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"Date: {{formatDate .Assessment.StartDateTime}}")])])])])],-1),e("h3",{id:"step-3-add-vulnerability-loop",tabindex:"-1"},[s("Step 3: Add Vulnerability Loop "),e("a",{class:"header-anchor",href:"#step-3-add-vulnerability-loop","aria-label":"Permalink to “Step 3: Add Vulnerability Loop”"},"​")],-1),e("p",null,"For vulnerability listings:",-1),e("div",null,[e("div",{class:"language-"},[e("button",{title:"Copy Code",class:"copy"}),e("span",{class:"lang"}),e("pre",{class:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabindex:"0",dir:"ltr","v-pre":""},[e("code",null,[e("span",{class:"line"},[e("span",null,"{{range .Vulnerabilities}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"Title: {{.DetailedTitle}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"Severity: {{.CVSSv31.Severity.Label}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"Score: {{.CVSSv31.Score}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"Description:")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Description}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"Remediation:")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Remediation}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{end}}")])])])])],-1),a("",7),e("div",null,[e("div",{class:"language-"},[e("button",{title:"Copy Code",class:"copy"}),e("span",{class:"lang"}),e("pre",{class:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabindex:"0",dir:"ltr","v-pre":""},[e("code",null,[e("span",{class:"line"},[e("span",null,"{{formatDate .Assessment.StartDateTime}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"# Output: DD/MM/YYYY")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,'{{formatDateTime .Assessment.StartDateTime "UTC" "US}}')]),s(`
`),e("span",{class:"line"},[e("span",null,"# Output: MM/DD/YYYY")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,'{{formatTime .Assessment.StartDateTime "UTC" "ISO"}}')]),s(`
`),e("span",{class:"line"},[e("span",null,"# Output: YYYY-MM-DD")])])])])],-1),e("h3",{id:"conditionals",tabindex:"-1"},[s("Conditionals "),e("a",{class:"header-anchor",href:"#conditionals","aria-label":"Permalink to “Conditionals”"},"​")],-1),e("div",null,[e("div",{class:"language-"},[e("button",{title:"Copy Code",class:"copy"}),e("span",{class:"lang"}),e("pre",{class:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabindex:"0",dir:"ltr","v-pre":""},[e("code",null,[e("span",{class:"line"},[e("span",null,"{{if .Assessment.OSSTMMVector}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"  OSSTMM Vector: {{.Assessment.OSSTMMVector}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{end}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,'{{if eq .Assessment.Status "Completed"}}')]),s(`
`),e("span",{class:"line"},[e("span",null,"  This assessment is complete.")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{else}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"  This assessment is ongoing.")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{end}}")])])])])],-1),e("h3",{id:"filtering-vulnerabilities",tabindex:"-1"},[s("Filtering Vulnerabilities "),e("a",{class:"header-anchor",href:"#filtering-vulnerabilities","aria-label":"Permalink to “Filtering Vulnerabilities”"},"​")],-1),e("div",null,[e("div",{class:"language-"},[e("button",{title:"Copy Code",class:"copy"}),e("span",{class:"lang"}),e("pre",{class:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabindex:"0",dir:"ltr","v-pre":""},[e("code",null,[e("span",{class:"line"},[e("span",null,"{{range .Vulnerabilities}}")]),s(`
`),e("span",{class:"line"},[e("span",null,'  {{if eq .Status "Open"}}')]),s(`
`),e("span",{class:"line"},[e("span",null,"    # Only show open vulnerabilities")]),s(`
`),e("span",{class:"line"},[e("span",null,"    Title: {{.DetailedTitle}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"  {{end}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{end}}")])])])])],-1),e("h2",{id:"examples",tabindex:"-1"},[s("Examples "),e("a",{class:"header-anchor",href:"#examples","aria-label":"Permalink to “Examples”"},"​")],-1),e("h3",{id:"executive-summary-template",tabindex:"-1"},[s("Executive Summary Template "),e("a",{class:"header-anchor",href:"#executive-summary-template","aria-label":"Permalink to “Executive Summary Template”"},"​")],-1),e("div",null,[e("div",{class:"language-"},[e("button",{title:"Copy Code",class:"copy"}),e("span",{class:"lang"}),e("pre",{class:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabindex:"0",dir:"ltr","v-pre":""},[e("code",null,[e("span",{class:"line"},[e("span",null,"EXECUTIVE SUMMARY")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"Client: {{.Customer.Name}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"Assessment: {{.Assessment.Name}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"Period: {{formatDate .Assessment.StartDateTime}} - {{formatDate .Assessment.EndDateTime}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"Status: {{.Assessment.Status}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"Total Findings: {{.Assessment.VulnerabilityCount}}")])])])])],-1),e("h3",{id:"detailed-findings-template",tabindex:"-1"},[s("Detailed Findings Template "),e("a",{class:"header-anchor",href:"#detailed-findings-template","aria-label":"Permalink to “Detailed Findings Template”"},"​")],-1),e("div",null,[e("div",{class:"language-"},[e("button",{title:"Copy Code",class:"copy"}),e("span",{class:"lang"}),e("pre",{class:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabindex:"0",dir:"ltr","v-pre":""},[e("code",null,[e("span",{class:"line"},[e("span",null,"DETAILED FINDINGS")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{range $index, $vuln := .Vulnerabilities}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{$vuln.DetailedTitle}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"Category: {{$vuln.Category.Name}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"Severity: {{$vuln.CVSSv31.Severity}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"CVSSv3.1 Score: {{$vuln.CVSSv31.Score}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"CVSSv3.1 Vector: {{$vuln.CVSSv31.Vector}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"CVSSv4.0 Score: {{$vuln.CVSSv4.Score}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"CVSSv4.0 Vector: {{$vuln.CVSSv4.Vector}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"Status: {{$vuln.Status}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"Affected Target: {{$vuln.Target.FQDN}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"Description:")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{breakParagraph $vuln.Description}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,'{{range $vuln.Poc.Pocs}}{{if eq .Type "request/response"}}')]),s(`
`),e("span",{class:"line"},[e("span",null,"{{preserveNewline .Description}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.URI}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"HTTP Request")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{range .RequestHighlighted}}{{preserveNewline (shadeTextBg .Text .Color)}}{{end}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"HTTP Response")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{range .ResponseHighlighted}}{{preserveNewline (shadeTextBg .Text .Color)}}{{end}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,'{{end}}{{if eq .Type "image"}}')]),s(`
`),e("span",{class:"line"},[e("span",null,"{{preserveNewline .Description}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.URI}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{image .ImageReference}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"Figure 1 - {{.ImageCaption}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,'{{end}}{{if eq .Type "text"}}')]),s(`
`),e("span",{class:"line"},[e("span",null,"{{preserveNewline .Description}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.URI}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{range .TextHighlighted}}{{preserveNewline (shadeTextBg .Text .Color)}}{{end}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{end}}{{end}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"Remediation:")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{breakParagraph $vuln.GenericRemediation.Text}} {{breakParagraph $vuln.Remediation}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"References:")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{range .Category.References}}{{.}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{end}}{{range .References}}{{.}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{end}} ")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{end}}")])])])])],-1),e("h3",{id:"cover-page-template",tabindex:"-1"},[s("Cover Page Template "),e("a",{class:"header-anchor",href:"#cover-page-template","aria-label":"Permalink to “Cover Page Template”"},"​")],-1),e("div",null,[e("div",{class:"language-"},[e("button",{title:"Copy Code",class:"copy"}),e("span",{class:"lang"}),e("pre",{class:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabindex:"0",dir:"ltr","v-pre":""},[e("code",null,[e("span",{class:"line"},[e("span",null,"{{.Customer.LogoReference}}   # Insert customer logo")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Assessment.Type.Full}} Report")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{.Customer.Name}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"Assessment Period:")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{formatDate .Assessment.StartDateTime}} to")]),s(`
`),e("span",{class:"line"},[e("span",null,"{{formatDate .Assessment.EndDateTime}}")]),s(`
`),e("span",{class:"line"},[e("span")]),s(`
`),e("span",{class:"line"},[e("span",null,"Prepared by: [Your Company Name]")]),s(`
`),e("span",{class:"line"},[e("span",null,"Date: {{formatDate .DeliveryDateTime}}")]),s(`
`),e("span",{class:"line"},[e("span",null,"Status: {{.Assessment.Status}}")])])])])],-1),a("",11)])])}const b=l(p,[["render",r]]);export{m as __pageData,b as default};
