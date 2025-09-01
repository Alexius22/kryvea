package report

import "github.com/Alexius22/kryvea/internal/mongo"

type ReportData struct {
	Customer                *mongo.Customer
	Assessment              *mongo.Assessment
	Vulnerabilities         []mongo.Vulnerability
	DeliveryDate            string
	MaxCVSS                 map[string]mongo.VulnerabilityCVSS // maps each cvss version to the vector with the highest score
	VulnerabilitiesOverview map[string]map[string]uint         // maps each cvss version to the aggregated vulnerability counts grouped by severity levels
	TargetsCategoryCounter  map[string]uint                    // groups all targets by name and maps them to the number of their occurrences
	OWASPCounter            map[string]OWASPCounter            // maps each category type to the OWASPCounter struct
}

// OWASPCounter represents a summary of findings for a given assessment.
//   - Categories maps each OWASP category to the hex color corresponding
//     to the highest found severity for that category
//   - Total: the total number of unique categories for wich at least
//     one vulnerability has been found
type OWASPCounter struct {
	Categories map[string]string
	Total      uint
}

func (rd *ReportData) Prepare() {
	// get highest cvss version
	maxVersion := ""
	for cvssVersion, enabled := range rd.Assessment.CVSSVersions {
		if !enabled {
			continue
		}

		if cvssVersion > maxVersion {
			maxVersion = cvssVersion
		}
	}

	// sanitize customer
	SanitizeCustomer(rd.Customer)

	// sanitize assessment
	SanitizeAssessment(rd.Assessment)

	// sanitize and sort vulnerabilities
	SanitizeAndSortVulnerabilities(rd.Vulnerabilities, maxVersion)

	// get max cvss
	rd.MaxCVSS = getMaxCvss(rd.Vulnerabilities, rd.Assessment.CVSSVersions)

	rd.VulnerabilitiesOverview = getVulnerabilitiesOverview(rd.Vulnerabilities, rd.Assessment.CVSSVersions)

	rd.TargetsCategoryCounter = getTargetsCategoryCounter(rd.Vulnerabilities, maxVersion)

	rd.OWASPCounter = getOWASPCounter(rd.Vulnerabilities, maxVersion)
}
