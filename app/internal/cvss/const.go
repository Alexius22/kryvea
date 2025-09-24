package cvss

import "sort"

const (
	Cvss2  = "2.0"
	Cvss3  = "3.0"
	Cvss31 = "3.1"
	Cvss4  = "4.0"

	Cvss2Prefix  = "CVSS2#"
	Cvss3Prefix  = "CVSS:3.0/"
	Cvss31Prefix = "CVSS:3.1/"
	Cvss4Prefix  = "CVSS:4.0"

	CvssSeverityCritical = "Critical"
	CvssSeverityHigh     = "High"
	CvssSeverityMedium   = "Medium"
	CvssSeverityLow      = "Low"
	CvssSeverityNone     = "Informational"

	InfoVector2  = "AV:L/AC:H/Au:M/C:N/I:N/A:N"
	InfoVector3  = "CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N"
	InfoVector31 = "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N"
	InfoVector4  = "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N"
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
