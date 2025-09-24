package reportdata

import (
	"fmt"

	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
)

var complexityColors = map[string]string{
	"Low":    "#EE0000",
	"Medium": "#FFC000",
	"High":   "#92d050",
}

var defaultComplexityColor = "#000000"

func addComplexityColor(vulnerability *mongo.Vulnerability) {
	vulnerability.CVSSv2.Complexity.Color = complexityColors[vulnerability.CVSSv2.Complexity.Label]
	if vulnerability.CVSSv2.Complexity.Color == "" {
		vulnerability.CVSSv2.Complexity.Color = defaultComplexityColor
	}

	vulnerability.CVSSv3.Complexity.Color = complexityColors[vulnerability.CVSSv3.Complexity.Label]
	if vulnerability.CVSSv3.Complexity.Color == "" {
		vulnerability.CVSSv3.Complexity.Color = defaultComplexityColor
	}

	vulnerability.CVSSv31.Complexity.Color = complexityColors[vulnerability.CVSSv31.Complexity.Label]
	if vulnerability.CVSSv31.Complexity.Color == "" {
		vulnerability.CVSSv31.Complexity.Color = defaultComplexityColor
	}

	vulnerability.CVSSv4.Complexity.Color = complexityColors[vulnerability.CVSSv4.Complexity.Label]
	if vulnerability.CVSSv4.Complexity.Color == "" {
		vulnerability.CVSSv4.Complexity.Color = defaultComplexityColor
	}

	fmt.Printf("Complexity colors: CVSSv2: %s, CVSSv3: %s, CVSSv31: %s, CVSSv4: %s\n",
		vulnerability.CVSSv2.Complexity.Color,
		vulnerability.CVSSv3.Complexity.Color,
		vulnerability.CVSSv31.Complexity.Color,
		vulnerability.CVSSv4.Complexity.Color,
	)
}

var severityColors = map[string]string{
	cvss.CvssSeverityCritical: "#7030A0",
	cvss.CvssSeverityHigh:     "#EE0000",
	cvss.CvssSeverityMedium:   "#FFC000",
	cvss.CvssSeverityLow:      "#FFFF00",
	cvss.CvssSeverityNone:     "#92d050",
}

var defaultSeverityColor = "#000000"

func addSeverityColor(vulnerability *mongo.Vulnerability) {
	vulnerability.CVSSv2.Severity.Color = severityColors[vulnerability.CVSSv2.Severity.Label]
	if vulnerability.CVSSv2.Severity.Color == "" {
		vulnerability.CVSSv2.Severity.Color = defaultSeverityColor
	}

	vulnerability.CVSSv3.Severity.Color = severityColors[vulnerability.CVSSv3.Severity.Label]
	if vulnerability.CVSSv3.Severity.Color == "" {
		vulnerability.CVSSv3.Severity.Color = defaultSeverityColor
	}

	vulnerability.CVSSv31.Severity.Color = severityColors[vulnerability.CVSSv31.Severity.Label]
	if vulnerability.CVSSv31.Severity.Color == "" {
		vulnerability.CVSSv31.Severity.Color = defaultSeverityColor
	}

	vulnerability.CVSSv4.Severity.Color = severityColors[vulnerability.CVSSv4.Severity.Label]
	if vulnerability.CVSSv4.Severity.Color == "" {
		vulnerability.CVSSv4.Severity.Color = defaultSeverityColor
	}

	fmt.Printf("Severity colors: CVSSv2: %s, CVSSv3: %s, CVSSv31: %s, CVSSv4: %s\n",
		vulnerability.CVSSv2.Severity.Color,
		vulnerability.CVSSv3.Severity.Color,
		vulnerability.CVSSv31.Severity.Color,
		vulnerability.CVSSv4.Severity.Color,
	)
}
