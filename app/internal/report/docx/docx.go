package docx

import (
	"github.com/Alexius22/kryvea/internal/report"
	gotemplatedocx "github.com/JJJJJJack/go-template-docx"
)

func GenerateReport(reportData *report.ReportData, template []byte) ([]byte, error) {
	DocxTemplate, err := gotemplatedocx.NewDocxTemplateFromBytes(template)
	if err != nil {
		return nil, err
	}

	for i, vulnerability := range reportData.Vulnerabilities {
		reportData.Vulnerabilities[i].Poc = report.SanitizeAndSortPoc(vulnerability.Poc)
	}

	err = DocxTemplate.Apply(reportData)
	if err != nil {
		return nil, err
	}

	return DocxTemplate.Bytes(), nil
}
