package templates

import (
	"fmt"
	"text/template"

	"github.com/Alexius22/kryvea/internal/poc"
	reportdata "github.com/Alexius22/kryvea/internal/report/data"
	gotemplatedocx "github.com/JJJJJJack/go-template-docx"
)

type DocxTemplate struct {
	TemplateBytes []byte
	filename      string
	extension     string
}

func NewDocxTemplate(templateBytes []byte) (*DocxTemplate, error) {
	if templateBytes == nil {
		return nil, ErrTemplateByteRequired
	}

	return &DocxTemplate{
		TemplateBytes: templateBytes,
		extension:     "docx",
	}, nil
}

func (t *DocxTemplate) Render(reportData *reportdata.ReportData) ([]byte, error) {
	t.filename = fmt.Sprintf("%s - %s - %s", reportData.Assessment.Type.Short, reportData.Customer.Name, reportData.Assessment.Name)

	reportData.Prepare()

	DocxTemplate, err := gotemplatedocx.NewDocxTemplateFromBytes(t.TemplateBytes)
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
		"formatDate":           reportdata.FormatDate,
		"getOWASPColor":        reportdata.GetOWASPColor,
		"tableSeverityColor":   reportdata.TableSeverityColor,
		"tableComplexityColor": reportdata.TableComplexityColor,
		"debug":                reportdata.Debug,
	})

	err = DocxTemplate.Apply(reportData)
	if err != nil {
		return nil, err
	}

	return DocxTemplate.Bytes(), nil
}

func (t *DocxTemplate) Filename() string {
	return fmt.Sprintf("%s.%s", t.filename, t.extension)
}

func (t *DocxTemplate) Extension() string {
	return t.extension
}
