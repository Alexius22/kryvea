package docx

import (
	"text/template"
	"time"

	"github.com/Alexius22/kryvea/internal/report"
	gotemplatedocx "github.com/JJJJJJack/go-template-docx"
)

func GenerateReport(reportData *report.ReportData, templateBytes []byte) ([]byte, error) {
	reportData.Prepare()

	DocxTemplate, err := gotemplatedocx.NewDocxTemplateFromBytes(templateBytes)
	if err != nil {
		return nil, err
	}

	DocxTemplate.AddTemplateFuncs(template.FuncMap{
		"formatDate": formatDate,
	})

	err = DocxTemplate.Apply(reportData)
	if err != nil {
		return nil, err
	}

	return DocxTemplate.Bytes(), nil
}

func formatDate(t time.Time) string {
	return t.Format("02/01/2006")
}
