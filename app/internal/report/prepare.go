package report

import (
	"fmt"

	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
)

func getMaxCvss(vulnerabilities []mongo.Vulnerability, cvssVersions map[string]bool) map[string]mongo.VulnerabilityCVSS {
	maxCvss := make(map[string]mongo.VulnerabilityCVSS)

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

		targetsCategoryCounter[vulnerability.Target.Name] += 1
	}

	fmt.Printf("targetsCategoryCounter: %+v\n", targetsCategoryCounter)

	return targetsCategoryCounter
}

func getOWASPCounter(vulnerabilities []mongo.Vulnerability, maxVersion string) map[string]OWASPCounter {
	owaspCounter := make(map[string]OWASPCounter)

	highestSeverityByCategoryType := make(map[string]float64)

	severityColors := map[string]string{
		cvss.CvssSeverityCritical: "#7030A0",
		cvss.CvssSeverityHigh:     "#EE0000",
		cvss.CvssSeverityMedium:   "#FFC000",
		cvss.CvssSeverityLow:      "#FFFF00",
		cvss.CvssSeverityNone:     "#92d050",
	}

	for _, vulnerability := range vulnerabilities {
		if _, ok := owaspCounter[vulnerability.Category.Source]; !ok {
			owaspCounter[vulnerability.Category.Source] = OWASPCounter{
				Categories: make(map[string]string),
			}
		}
		if _, ok := owaspCounter[vulnerability.Category.Source].Categories[vulnerability.Category.Index]; !ok {
			counter := owaspCounter[vulnerability.Category.Source]
			counter.Total += 1

			switch maxVersion {
			case cvss.Cvss2:
				if vulnerability.CVSSv2.Score > highestSeverityByCategoryType[vulnerability.Category.Index] {
					highestSeverityByCategoryType[vulnerability.Category.Index] = vulnerability.CVSSv2.Score
					counter.Categories[vulnerability.Category.Index] = severityColors[vulnerability.CVSSv2.Severity.Label]
				}
			case cvss.Cvss3:
				if vulnerability.CVSSv3.Score > highestSeverityByCategoryType[vulnerability.Category.Index] {
					highestSeverityByCategoryType[vulnerability.Category.Index] = vulnerability.CVSSv3.Score
					counter.Categories[vulnerability.Category.Index] = severityColors[vulnerability.CVSSv3.Severity.Label]
				}
			case cvss.Cvss31:
				if vulnerability.CVSSv31.Score > highestSeverityByCategoryType[vulnerability.Category.Index] {
					highestSeverityByCategoryType[vulnerability.Category.Index] = vulnerability.CVSSv31.Score
					counter.Categories[vulnerability.Category.Index] = severityColors[vulnerability.CVSSv31.Severity.Label]
				}
			case cvss.Cvss4:
				if vulnerability.CVSSv4.Score > highestSeverityByCategoryType[vulnerability.Category.Index] {
					highestSeverityByCategoryType[vulnerability.Category.Index] = vulnerability.CVSSv4.Score
					counter.Categories[vulnerability.Category.Index] = severityColors[vulnerability.CVSSv4.Severity.Label]
				}
			}

			owaspCounter[vulnerability.Category.Source] = counter
		}
	}

	fmt.Printf("owaspCounter: %+v\n", owaspCounter)

	return owaspCounter
}
