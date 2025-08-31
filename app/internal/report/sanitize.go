package report

import (
	"bytes"
	"encoding/xml"
	"sort"
	"strings"

	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
)

func SanitizeAndSortVulnerabilities(vulnerabilities []mongo.Vulnerability, version string) []mongo.Vulnerability {
	if len(vulnerabilities) == 0 {
		return vulnerabilities
	}

	sanitized := make([]mongo.Vulnerability, len(vulnerabilities))
	copy(sanitized, vulnerabilities)

	for i := range sanitized {
		sanitized[i] = sanitizeVulnerability(sanitized[i])

		switch version {
		case cvss.Cvss2:
			sort.Slice(sanitized, func(j, k int) bool {
				return sanitized[j].CVSSv2.CVSSScore < sanitized[k].CVSSv2.CVSSScore
			})
		case cvss.Cvss3:
			sort.Slice(sanitized, func(j, k int) bool {
				return sanitized[j].CVSSv3.CVSSScore < sanitized[k].CVSSv3.CVSSScore
			})
		case cvss.Cvss31:
			sort.Slice(sanitized, func(j, k int) bool {
				return sanitized[j].CVSSv31.CVSSScore < sanitized[k].CVSSv31.CVSSScore
			})
		case cvss.Cvss4:
			sort.Slice(sanitized, func(j, k int) bool {
				return sanitized[j].CVSSv4.CVSSScore < sanitized[k].CVSSv4.CVSSScore
			})
		}
	}

	return sanitized
}

// TODO: add remaining fields
func sanitizeVulnerability(item mongo.Vulnerability) mongo.Vulnerability {
	references := make([]string, len(item.References))
	for i, reference := range item.References {
		references[i] = escapeXMLString(reference)
	}

	return mongo.Vulnerability{
		Category: mongo.Category{
			Name:  escapeXMLString(item.Category.Name),
			Index: escapeXMLString(item.Category.Index),
		},
		DetailedTitle: escapeXMLString(item.DetailedTitle),
		Status:        escapeXMLString(item.Status),

		References: references,
		GenericDescription: mongo.VulnerabilityGeneric{
			Enabled: item.GenericDescription.Enabled,
			Text:    escapeXMLString(item.GenericDescription.Text),
		},
		GenericRemediation: mongo.VulnerabilityGeneric{
			Enabled: item.GenericRemediation.Enabled,
			Text:    escapeXMLString(item.GenericRemediation.Text),
		},
		Description: escapeXMLString(item.Description),
		Remediation: escapeXMLString(item.Remediation),
	}
}

func SanitizeAndSortPoc(poc mongo.Poc) mongo.Poc {
	sanitized := poc

	if len(poc.Pocs) == 0 {
		return sanitized
	}

	sanitized.Pocs = make([]mongo.PocItem, len(poc.Pocs))

	for i, oldPoc := range poc.Pocs {
		sanitized.Pocs[i] = sanitizePocItem(oldPoc)
	}

	sort.Slice(sanitized.Pocs, func(i, j int) bool {
		return sanitized.Pocs[i].Index < sanitized.Pocs[j].Index
	})

	return sanitized
}

func sanitizePocItem(item mongo.PocItem) mongo.PocItem {
	return mongo.PocItem{
		Type:          escapeXMLString(item.Type),
		Description:   escapeXMLString(item.Description),
		URI:           escapeXMLString(item.URI),
		Request:       escapeXMLString(item.Request),
		Response:      escapeXMLString(item.Response),
		ImageFilename: escapeXMLString(item.ImageFilename),
		ImageCaption:  escapeXMLString(item.ImageCaption),
		TextLanguage:  escapeXMLString(item.TextLanguage),
		TextData:      escapeXMLString(item.TextData),
	}
}

func escapeXMLString(s string) string {
	var buf bytes.Buffer
	xml.EscapeText(&buf, []byte(s))
	escaped := strings.ReplaceAll(buf.String(), "&#xA;", "</w:t></w:r><w:r w:rsidR=\"006C359A\"><w:rPr><w:noProof /></w:rPr><w:br /></w:r><w:r><w:rPr><w:noProof /></w:rPr><w:t>")
	return escaped
}
