package templates

import (
	"fmt"
	"text/template"
	"time"

	"github.com/Alexius22/kryvea/internal/poc"
	reportdata "github.com/Alexius22/kryvea/internal/report/data"
	gotemplatedocx "github.com/JJJJJJack/go-template-docx"
)

type DocxTemplate struct{}

func (t DocxTemplate) Render(reportData *reportdata.ReportData, templateBytes []byte) ([]byte, error) {
	reportData.Prepare()

	DocxTemplate, err := gotemplatedocx.NewDocxTemplateFromBytes(templateBytes)
	if err != nil {
		return nil, err
	}

	addedImages := make(map[string]bool)
	for _, vulnerability := range reportData.Vulnerabilities {
		for _, pocItem := range vulnerability.Poc.Pocs {
			if pocItem.Type == poc.PocTypeImage {
				if _, ok := addedImages[pocItem.ImageFilename]; !ok {
					fmt.Println("adding image:", pocItem.ImageFilename)
					DocxTemplate.Media(pocItem.ImageFilename, pocItem.ImageData)
					addedImages[pocItem.ImageFilename] = true
				}
			}
		}
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
