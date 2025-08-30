package report

import "github.com/Alexius22/kryvea/internal/mongo"

type ReportData struct {
	Customer                *mongo.Customer
	Assessment              *mongo.Assessment
	Vulnerabilities         []mongo.Vulnerability
	DeliveryDate            string
	MaxCVSS                 map[string]mongo.VulnerabilityCVSS
	VulnerabilitiesOverwiev map[string]VulnerabilityOverview
}

type VulnerabilityOverview struct {
	Label string
	Value uint
}
