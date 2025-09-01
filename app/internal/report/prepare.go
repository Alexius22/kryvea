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
				if vulnerability.CVSSv2.CVSSScore > maxCvss[version].CVSSScore {
					maxCvss[version] = vulnerability.CVSSv2
				}
			case cvss.Cvss3:
				if vulnerability.CVSSv3.CVSSScore > maxCvss[version].CVSSScore {
					maxCvss[version] = vulnerability.CVSSv3
				}
			case cvss.Cvss31:
				if vulnerability.CVSSv31.CVSSScore > maxCvss[version].CVSSScore {
					maxCvss[version] = vulnerability.CVSSv31
				}
			case cvss.Cvss4:
				if vulnerability.CVSSv4.CVSSScore > maxCvss[version].CVSSScore {
					maxCvss[version] = vulnerability.CVSSv4
				}
			}
		}
	}

	fmt.Println(maxCvss)

	return maxCvss
}

func getVulnerabilitiesOverview(vulnerabilities []mongo.Vulnerability, cvssVersions map[string]bool) map[string]map[string]uint {
	vulnerabilityOverview := make(map[string]map[string]uint)

	for _, vulnerability := range vulnerabilities {
		for version, enabled := range cvssVersions {
			if !enabled {
				continue
			}

			if vulnerabilityOverview[version] == nil {
				vulnerabilityOverview[version] = make(map[string]uint)
			}

			switch version {
			case cvss.Cvss2:
				vulnerabilityOverview[version][vulnerability.CVSSv2.CVSSSeverity] += 1
			case cvss.Cvss3:
				vulnerabilityOverview[version][vulnerability.CVSSv3.CVSSSeverity] += 1
			case cvss.Cvss31:
				vulnerabilityOverview[version][vulnerability.CVSSv31.CVSSSeverity] += 1
			case cvss.Cvss4:
				vulnerabilityOverview[version][vulnerability.CVSSv4.CVSSSeverity] += 1
			}
		}

	}

	fmt.Println(vulnerabilityOverview)

	return vulnerabilityOverview
}

func getTargetsCategoryCounter(vulnerabilities []mongo.Vulnerability, maxVersion string) map[string]uint {
	targetsCategoryCounter := make(map[string]uint)

	for _, vulnerability := range vulnerabilities {
		if (maxVersion == cvss.Cvss2 && vulnerability.CVSSv2.CVSSSeverity == cvss.CvssSeverityNone) ||
			(maxVersion == cvss.Cvss3 && vulnerability.CVSSv3.CVSSSeverity == cvss.CvssSeverityNone) ||
			(maxVersion == cvss.Cvss31 && vulnerability.CVSSv31.CVSSSeverity == cvss.CvssSeverityNone) ||
			(maxVersion == cvss.Cvss4 && vulnerability.CVSSv4.CVSSSeverity == cvss.CvssSeverityNone) {
			continue
		}

		targetsCategoryCounter[vulnerability.Target.Name] += 1
	}

	fmt.Println(targetsCategoryCounter)

	return targetsCategoryCounter
}

func getOWASPCounter(vulnerabilities []mongo.Vulnerability, maxVersion string) map[string]OWASPCounter {
	owaspCounter := make(map[string]OWASPCounter)

	highestSeverityByCategoryType := make(map[string]float64)

	severityColors := map[string]string{
		cvss.CvssSeverityCritical: "#800080",
		cvss.CvssSeverityHigh:     "#ff0000",
		cvss.CvssSeverityMedium:   "#ffa500",
		cvss.CvssSeverityLow:      "#ffff00",
		cvss.CvssSeverityNone:     "#008000",
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
				if vulnerability.CVSSv2.CVSSScore > highestSeverityByCategoryType[vulnerability.Category.Index] {
					highestSeverityByCategoryType[vulnerability.Category.Index] = vulnerability.CVSSv2.CVSSScore
					counter.Categories[vulnerability.Category.Index] = severityColors[vulnerability.CVSSv2.CVSSSeverity]
				}
			case cvss.Cvss3:
				if vulnerability.CVSSv3.CVSSScore > highestSeverityByCategoryType[vulnerability.Category.Index] {
					highestSeverityByCategoryType[vulnerability.Category.Index] = vulnerability.CVSSv3.CVSSScore
					counter.Categories[vulnerability.Category.Index] = severityColors[vulnerability.CVSSv3.CVSSSeverity]
				}
			case cvss.Cvss31:
				if vulnerability.CVSSv31.CVSSScore > highestSeverityByCategoryType[vulnerability.Category.Index] {
					highestSeverityByCategoryType[vulnerability.Category.Index] = vulnerability.CVSSv31.CVSSScore
					counter.Categories[vulnerability.Category.Index] = severityColors[vulnerability.CVSSv31.CVSSSeverity]
				}
			case cvss.Cvss4:
				if vulnerability.CVSSv4.CVSSScore > highestSeverityByCategoryType[vulnerability.Category.Index] {
					highestSeverityByCategoryType[vulnerability.Category.Index] = vulnerability.CVSSv4.CVSSScore
					counter.Categories[vulnerability.Category.Index] = severityColors[vulnerability.CVSSv4.CVSSSeverity]
				}
			}

			owaspCounter[vulnerability.Category.Source] = counter
		}
	}

	fmt.Println(owaspCounter)

	return owaspCounter
}
