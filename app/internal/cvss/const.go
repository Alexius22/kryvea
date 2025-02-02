package cvss

import "sort"

const (
	CVSS2  = "2.0"
	CVSS3  = "3.0"
	CVSS31 = "3.1"
	CVSS4  = "4.0"

	CVSS_CRITICAL = "Critical"
	CVSS_HIGH     = "High"
	CVSS_MEDIUM   = "Medium"
	CVSS_LOW      = "Low"
	CVSS_NONE     = "None"
)

var (
	CVSSVersions = []string{CVSS2, CVSS3, CVSS31, CVSS4}
)

type SeverityThreshold struct {
	Score    float64
	Severity string
}

var severityLevels = map[string][]SeverityThreshold{
	CVSS2: {
		{7.0, CVSS_HIGH},
		{4.0, CVSS_MEDIUM},
		{0.0, CVSS_LOW},
	},
	CVSS3: {
		{9.0, CVSS_CRITICAL},
		{7.0, CVSS_HIGH},
		{4.0, CVSS_MEDIUM},
		{0.1, CVSS_LOW},
		{0.0, CVSS_NONE},
	},
	CVSS31: {
		{9.0, CVSS_CRITICAL},
		{7.0, CVSS_HIGH},
		{4.0, CVSS_MEDIUM},
		{0.1, CVSS_LOW},
		{0.0, CVSS_NONE},
	},
	CVSS4: {
		{9.0, CVSS_CRITICAL},
		{7.0, CVSS_HIGH},
		{4.0, CVSS_MEDIUM},
		{0.1, CVSS_LOW},
		{0.0, CVSS_NONE},
	},
}

func init() {
	for _, thresholds := range severityLevels {
		sort.Slice(thresholds, func(i, j int) bool {
			return thresholds[i].Score > thresholds[j].Score
		})
	}
}
