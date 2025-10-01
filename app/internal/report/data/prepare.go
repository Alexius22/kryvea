package reportdata

import (
	"fmt"
	"strings"

	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
)

func getMaxCvss(vulnerabilities []mongo.Vulnerability, cvssVersions map[string]bool) map[string]cvss.Vector {
	maxCvss := make(map[string]cvss.Vector)

	for _, vulnerability := range vulnerabilities {
		for version, enabled := range cvssVersions {
			if !enabled {
				continue
			}

			switch version {
			case cvss.Cvss2:
				if vulnerability.CVSSv2.Score > maxCvss[version].Score {
					maxCvss[version] = vulnerability.CVSSv2
				}
			case cvss.Cvss3:
				if vulnerability.CVSSv3.Score > maxCvss[version].Score {
					maxCvss[version] = vulnerability.CVSSv3
				}
			case cvss.Cvss31:
				if vulnerability.CVSSv31.Score > maxCvss[version].Score {
					maxCvss[version] = vulnerability.CVSSv31
				}
			case cvss.Cvss4:
				if vulnerability.CVSSv4.Score > maxCvss[version].Score {
					maxCvss[version] = vulnerability.CVSSv4
				}
			}
		}
	}

	fmt.Printf("maxCvss: %+v\n", maxCvss)

	return maxCvss
}

func getVulnerabilitiesOverview(vulnerabilities []mongo.Vulnerability, cvssVersions map[string]bool) map[string]map[string]uint {
	vulnerabilityOverview := make(map[string]map[string]uint)

	for _, vulnerability := range vulnerabilities {
		for _, version := range cvss.CvssVersions {
			if vulnerabilityOverview[version] == nil {
				vulnerabilityOverview[version] = make(map[string]uint)
				for _, severity := range cvss.CvssSeverities {
					vulnerabilityOverview[version][severity] = 0
				}
			}

			if !cvssVersions[version] {
				continue
			}

			switch version {
			case cvss.Cvss2:
				vulnerabilityOverview[version][vulnerability.CVSSv2.Severity.Label] += 1
			case cvss.Cvss3:
				vulnerabilityOverview[version][vulnerability.CVSSv3.Severity.Label] += 1
			case cvss.Cvss31:
				vulnerabilityOverview[version][vulnerability.CVSSv31.Severity.Label] += 1
			case cvss.Cvss4:
				vulnerabilityOverview[version][vulnerability.CVSSv4.Severity.Label] += 1
			}
		}
	}

	fmt.Printf("vulnerabilityOverview: %+v\n", vulnerabilityOverview)

	return vulnerabilityOverview
}

func getTargetsCategoryCounter(vulnerabilities []mongo.Vulnerability, maxVersion string) map[string]uint {
	targetsCategoryCounter := make(map[string]uint)

	for _, vulnerability := range vulnerabilities {
		if (maxVersion == cvss.Cvss2 && vulnerability.CVSSv2.Severity.Label == cvss.CvssSeverityNone) ||
			(maxVersion == cvss.Cvss3 && vulnerability.CVSSv3.Severity.Label == cvss.CvssSeverityNone) ||
			(maxVersion == cvss.Cvss31 && vulnerability.CVSSv31.Severity.Label == cvss.CvssSeverityNone) ||
			(maxVersion == cvss.Cvss4 && vulnerability.CVSSv4.Severity.Label == cvss.CvssSeverityNone) {
			continue
		}

		targetsCategoryCounter[vulnerability.Target.Tag] += 1
	}

	fmt.Printf("targetsCategoryCounter: %+v\n", targetsCategoryCounter)

	return targetsCategoryCounter
}

func getOWASPCounter(vulnerabilities []mongo.Vulnerability, maxVersion string) map[string]OWASPCounter {
	owaspCounter := make(map[string]OWASPCounter)

	highestSeverityByCategoryType := make(map[string]float64)

	for _, vulnerability := range vulnerabilities {
		if _, ok := owaspCounter[vulnerability.Category.Source]; !ok {
			owaspCounter[vulnerability.Category.Source] = OWASPCounter{
				Categories: make(map[string]string),
			}
		}
		if _, ok := owaspCounter[vulnerability.Category.Source].Categories[vulnerability.Category.Identifier]; !ok {
			counter := owaspCounter[vulnerability.Category.Source]
			counter.Total += 1

			switch maxVersion {
			case cvss.Cvss2:
				if vulnerability.CVSSv2.Score > highestSeverityByCategoryType[vulnerability.Category.Identifier] {
					highestSeverityByCategoryType[vulnerability.Category.Identifier] = vulnerability.CVSSv2.Score
					counter.Categories[vulnerability.Category.Identifier] = severityColors[vulnerability.CVSSv2.Severity.Label]
				}
			case cvss.Cvss3:
				if vulnerability.CVSSv3.Score > highestSeverityByCategoryType[vulnerability.Category.Identifier] {
					highestSeverityByCategoryType[vulnerability.Category.Identifier] = vulnerability.CVSSv3.Score
					counter.Categories[vulnerability.Category.Identifier] = severityColors[vulnerability.CVSSv3.Severity.Label]
				}
			case cvss.Cvss31:
				if vulnerability.CVSSv31.Score > highestSeverityByCategoryType[vulnerability.Category.Identifier] {
					highestSeverityByCategoryType[vulnerability.Category.Identifier] = vulnerability.CVSSv31.Score
					counter.Categories[vulnerability.Category.Identifier] = severityColors[vulnerability.CVSSv31.Severity.Label]
				}
			case cvss.Cvss4:
				if vulnerability.CVSSv4.Score > highestSeverityByCategoryType[vulnerability.Category.Identifier] {
					highestSeverityByCategoryType[vulnerability.Category.Identifier] = vulnerability.CVSSv4.Score
					counter.Categories[vulnerability.Category.Identifier] = severityColors[vulnerability.CVSSv4.Severity.Label]
				}
			}

			owaspCounter[vulnerability.Category.Source] = counter
		}
	}

	fmt.Printf("owaspCounter: %+v\n", owaspCounter)

	return owaspCounter
}

func parseHighlights(vulnerabilities []mongo.Vulnerability) {
	for i := range vulnerabilities {
		for j := range vulnerabilities[i].Poc.Pocs {
			parseHighlightedText(&vulnerabilities[i].Poc.Pocs[j])
		}
	}
}

func parseHighlightedText(pocitem *mongo.PocItem) {
	if pocitem.RequestHighlights != nil {
		pocitem.RequestHighlighted = splitText(pocitem.Request, pocitem.RequestHighlights)
	}
	if pocitem.ResponseHighlights != nil {
		pocitem.ResponseHighlighted = splitText(pocitem.Response, pocitem.ResponseHighlights)
	}
	if pocitem.TextHighlights != nil {
		pocitem.TextHighlighted = splitText(pocitem.TextData, pocitem.TextHighlights)
	}
}

func splitText(s string, coordinates []mongo.HighlightedText) []mongo.Highlighted {
	if len(coordinates) == 0 {
		return []mongo.Highlighted{
			{
				Text:  s,
				Color: "",
			},
		}
	}

	rows := strings.SplitAfter(s, "\n")
	colors := make([][]string, len(rows))
	for i := range colors {
		colors[i] = make([]string, len(rows[i]))
		for j := range len(rows[i]) {
			colors[i][j] = ""
		}
	}

	modified := true
	for modified {
		for i := 0; i < len(coordinates); i++ {
			modified = false
			if coordinates[i].Start.Line > len(rows) {
				copy(coordinates[i:], coordinates[i+1:])
				continue
			}
			if coordinates[i].End.Line > len(rows) {
				coordinates[i].End.Line = len(rows)
				coordinates[i].End.Col = len(rows[coordinates[i].End.Line-1])
			}
			if coordinates[i].Start.Line != coordinates[i].End.Line {
				coordinates = append(coordinates, mongo.HighlightedText{})
				first, second := coordinates[i], coordinates[i]

				first.End.Line--
				first.End.Col = len(rows[first.End.Line])

				second.Start.Line++
				second.Start.Col = 1

				copy(coordinates[i+2:], coordinates[i+1:])
				coordinates[i] = first
				coordinates[i+1] = second
				modified = true
			}
			if coordinates[i].Start.Col > len(rows[coordinates[i].Start.Line-1]) {
				coordinates[i].Start.Col = len(rows[coordinates[i].Start.Line-1])
			}
			if coordinates[i].Start.Col < 0 {
				coordinates[i].Start.Col = 1
			}
			if coordinates[i].End.Col > len(rows[coordinates[i].End.Line-1]) {
				coordinates[i].End.Col = len(rows[coordinates[i].End.Line-1])
			}
			if coordinates[i].End.Col < 0 {
				coordinates[i].End.Col = 1
			}
		}
	}

	for _, coordinate := range coordinates {
		for i := coordinate.Start.Col; i < coordinate.End.Col; i++ {
			colors[coordinate.Start.Line-1][i-1] = coordinate.Color
		}
	}

	splitted := []mongo.Highlighted{}
	splitColor := mongo.Highlighted{
		Text:  "",
		Color: "",
	}

	builder := strings.Builder{}
	for i, colorRow := range colors {
		for j, color := range colorRow {
			if color != splitColor.Color {
				splitColor.Text = builder.String()
				if splitColor.Text != "" {
					splitted = append(splitted, splitColor)
				}
				splitColor = mongo.Highlighted{}
				builder = strings.Builder{}
			}
			builder.WriteByte(rows[i][j])
			splitColor.Color = color
		}
	}
	if builder.Len() > 0 {
		splitColor.Text = builder.String()
		splitted = append(splitted, splitColor)
	}

	return splitted
}
