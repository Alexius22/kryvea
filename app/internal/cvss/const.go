package cvss

import "sort"

const (
	Cvss2  = "2.0"
	Cvss3  = "3.0"
	Cvss31 = "3.1"
	Cvss4  = "4.0"

	CvssSeverityCritical = "Critical"
	CvssSeverityHigh     = "High"
	CvssSeverityMedium   = "Medium"
	CvssSeverityLow      = "Low"
	CvssSeverityNone     = "Informational"
)

var (
	CvssVersions   = []string{Cvss2, Cvss3, Cvss31, Cvss4}
	VersionToValue = map[string]int{
		Cvss2:  20,
		Cvss3:  30,
		Cvss31: 31,
		Cvss4:  40,
	}

	CvssSeverities = []string{
		CvssSeverityCritical,
		CvssSeverityHigh,
		CvssSeverityMedium,
		CvssSeverityLow,
		CvssSeverityNone,
	}
)

type SeverityThreshold struct {
	Score    float64
	Severity string
}

var severityLevels = map[string][]SeverityThreshold{
	Cvss2: {
		{7.0, CvssSeverityHigh},
		{4.0, CvssSeverityMedium},
		{0.0, CvssSeverityLow},
	},
	Cvss3: {
		{9.0, CvssSeverityCritical},
		{7.0, CvssSeverityHigh},
		{4.0, CvssSeverityMedium},
		{0.1, CvssSeverityLow},
		{0.0, CvssSeverityNone},
	},
	Cvss31: {
		{9.0, CvssSeverityCritical},
		{7.0, CvssSeverityHigh},
		{4.0, CvssSeverityMedium},
		{0.1, CvssSeverityLow},
		{0.0, CvssSeverityNone},
	},
	Cvss4: {
		{9.0, CvssSeverityCritical},
		{7.0, CvssSeverityHigh},
		{4.0, CvssSeverityMedium},
		{0.1, CvssSeverityLow},
		{0.0, CvssSeverityNone},
	},
}

func init() {
	for _, thresholds := range severityLevels {
		sort.Slice(thresholds, func(i, j int) bool {
			return thresholds[i].Score > thresholds[j].Score
		})
	}
}
