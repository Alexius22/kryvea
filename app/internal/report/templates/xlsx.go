package templates

import (
	reportdata "github.com/Alexius22/kryvea/internal/report/data"
)

type XlsxTemplate struct {
	TemplateBytes []byte
}

func NewXlsxTemplate(templateBytes []byte) (*XlsxTemplate, error) {
	if templateBytes == nil {
		return nil, ErrTemplateByteRequired
	}

	return &XlsxTemplate{
		TemplateBytes: templateBytes,
	}, nil
}

func (t *XlsxTemplate) Render(reportData *reportdata.ReportData) ([]byte, error) {
	return []byte{}, nil
}

func (t *XlsxTemplate) Extension() string {
	return "xlsx"
}
