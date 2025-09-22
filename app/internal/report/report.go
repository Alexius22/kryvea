package report

import (
	"errors"

	reportdata "github.com/Alexius22/kryvea/internal/report/data"
	"github.com/Alexius22/kryvea/internal/report/templates"
)

const (
	ReportTemplateXlsx string = "xlsx"
	ReportTemplateDocx string = "docx"

	ReportCustomClassic string = "custom-classic"
)

var (
	ErrTemplateTypeNA error = errors.New("template type not available")

	ReportExtension map[string]string = map[string]string{
		ReportTemplateXlsx:  "xlsx",
		ReportTemplateDocx:  "docx",
		ReportCustomClassic: "zip",
	}

	ReportTemplateMap map[string]struct{} = map[string]struct{}{
		ReportTemplateXlsx: {},
		ReportTemplateDocx: {},
	}

	ReportCustomMap map[string]struct{} = map[string]struct{}{
		ReportCustomClassic: {},
	}
)

type Report interface {
	Render(reportData *reportdata.ReportData) ([]byte, error)
	Extension() string
}

func New(reportType string, templateBytes []byte) (Report, error) {
	switch reportType {
	case ReportTemplateXlsx:
		return templates.NewDocxTemplate(templateBytes)
	case ReportTemplateDocx:
		return templates.NewXlsxTemplate(templateBytes)
	case ReportCustomClassic:
		return templates.NewCustomClassicTemplate()
	}

	return nil, ErrTemplateTypeNA
}
