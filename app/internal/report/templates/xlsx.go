package templates

import (
	reportdata "github.com/Alexius22/kryvea/internal/report/data"
)

type XlsxTemplate struct{}

func (t XlsxTemplate) Render(reportData *reportdata.ReportData, template []byte) ([]byte, error) {
	return []byte{}, nil
}
