package report

import (
	"errors"

	reportdata "github.com/Alexius22/kryvea/internal/report/data"
	"github.com/Alexius22/kryvea/internal/report/templates"
)

const (
	ReportXlsx string = "xlsx"
	ReportDocx string = "docx"

	ReportCustomClassic string = "custom-classic"
)

var (
	ErrTemplateTypeNA error = errors.New("template type not available")
)

type Report interface {
	Render(reportData *reportdata.ReportData, template []byte) ([]byte, error)
}

func New(reportType string) (Report, error) {
	switch reportType {
	case ReportXlsx:
		return templates.XlsxTemplate{}, nil
	case ReportDocx:
		return templates.DocxTemplate{}, nil
		// case ReportCustomClassic:
		// return templates.CustomClassicTemplate{}, nil
	}

	return nil, ErrTemplateTypeNA
}
