package report

import (
	"bytes"
	"encoding/xml"
	"sort"
	"strings"

	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
)

func SanitizeCustomer(customer *mongo.Customer) {
	customer.Name = escapeXMLString(customer.Name)
	customer.Language = escapeXMLString(customer.Language)
}

func SanitizeAssessment(assessment *mongo.Assessment) {
	sanitizeTargets := make([]mongo.Target, len(assessment.Targets))
	for i, target := range assessment.Targets {
		sanitizeTarget(&target)
		sanitizeTargets[i] = target
	}

	assessment.Name = escapeXMLString(assessment.Name)
	assessment.Targets = sanitizeTargets
	assessment.Status = escapeXMLString(assessment.Status)
	assessment.AssessmentType.Short = escapeXMLString(assessment.AssessmentType.Short)
	assessment.AssessmentType.Full = escapeXMLString(assessment.AssessmentType.Full)
	assessment.Environment = escapeXMLString(assessment.Environment)
	assessment.TestingType = escapeXMLString(assessment.TestingType)
	assessment.OSSTMMVector = escapeXMLString(assessment.OSSTMMVector)
}

func sanitizeTarget(target *mongo.Target) {
	target.IPv4 = escapeXMLString(target.IPv4)
	target.IPv6 = escapeXMLString(target.IPv6)
	target.Protocol = escapeXMLString(target.Protocol)
	target.FQDN = escapeXMLString(target.FQDN)
	target.Name = escapeXMLString(target.Name)
}

func SanitizeAndSortVulnerabilities(vulnerabilities []mongo.Vulnerability, version string) {
	if len(vulnerabilities) == 0 {
		return
	}

	for i := range vulnerabilities {
		sanitizeVulnerability(&vulnerabilities[i])

		switch version {
		case cvss.Cvss2:
			sort.Slice(vulnerabilities, func(j, k int) bool {
				return vulnerabilities[j].CVSSv2.CVSSScore < vulnerabilities[k].CVSSv2.CVSSScore
			})
		case cvss.Cvss3:
			sort.Slice(vulnerabilities, func(j, k int) bool {
				return vulnerabilities[j].CVSSv3.CVSSScore < vulnerabilities[k].CVSSv3.CVSSScore
			})
		case cvss.Cvss31:
			sort.Slice(vulnerabilities, func(j, k int) bool {
				return vulnerabilities[j].CVSSv31.CVSSScore < vulnerabilities[k].CVSSv31.CVSSScore
			})
		case cvss.Cvss4:
			sort.Slice(vulnerabilities, func(j, k int) bool {
				return vulnerabilities[j].CVSSv4.CVSSScore < vulnerabilities[k].CVSSv4.CVSSScore
			})
		}
	}
}

// TODO: add remaining fields
func sanitizeVulnerability(item *mongo.Vulnerability) {
	references := make([]string, len(item.References))
	for i, reference := range item.References {
		references[i] = escapeXMLString(reference)
	}

	SanitizeAndSortPoc(&item.Poc)

	item.Category.Name = escapeXMLString(item.Category.Name)
	item.Category.Index = escapeXMLString(item.Category.Index)
	item.DetailedTitle = escapeXMLString(item.DetailedTitle)
	item.Status = escapeXMLString(item.Status)
	item.References = references
	item.GenericDescription.Text = escapeXMLString(item.GenericDescription.Text)
	item.GenericRemediation.Text = escapeXMLString(item.GenericRemediation.Text)
	item.Description = escapeXMLString(item.Description)
	item.Remediation = escapeXMLString(item.Remediation)
}

func SanitizeAndSortPoc(poc *mongo.Poc) {
	if len(poc.Pocs) == 0 {
		return
	}

	for _, oldPoc := range poc.Pocs {
		sanitizePocItem(&oldPoc)
	}

	sort.Slice(poc.Pocs, func(i, j int) bool {
		return poc.Pocs[i].Index < poc.Pocs[j].Index
	})
}

func sanitizePocItem(item *mongo.PocItem) {
	item.Type = escapeXMLString(item.Type)
	item.Description = escapeXMLString(item.Description)
	item.URI = escapeXMLString(item.URI)
	item.Request = escapeXMLString(item.Request)
	item.Response = escapeXMLString(item.Response)
	item.ImageFilename = escapeXMLString(item.ImageFilename)
	item.ImageCaption = escapeXMLString(item.ImageCaption)
	item.TextLanguage = escapeXMLString(item.TextLanguage)
	item.TextData = escapeXMLString(item.TextData)
}

func escapeXMLString(s string) string {
	var buf bytes.Buffer
	xml.EscapeText(&buf, []byte(s))
	escaped := strings.ReplaceAll(buf.String(), "&#xA;", "</w:t></w:r><w:r w:rsidR=\"006C359A\"><w:rPr><w:noProof /></w:rPr><w:br /></w:r><w:r><w:rPr><w:noProof /></w:rPr><w:t>")
	return escaped
}
