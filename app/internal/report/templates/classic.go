package templates

import (
	"bytes"
	"fmt"
	"path/filepath"
	"sort"
	"strings"

	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
	reportdata "github.com/Alexius22/kryvea/internal/report/data"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/Alexius22/kryvea/internal/zip"
	"github.com/xuri/excelize/v2"
)

const (
	ColumnID          = "ID"
	ColumnSeverity    = "Severity"
	ColumnStatus      = "Status"
	ColumnName        = "Name"
	ColumnIntro       = "Introduction"
	ColumnDescription = "Description"
	ColumnPOC         = "Proof of Concept"
	ColumnRemediation = "Remediations"
	ColumnReferences  = "References"

	ColumnVulnID   = "Vuln ID"
	ColumnPOCID    = "POC ID"
	ColumnNotes    = "Note"
	ColumnRequest  = "Request"
	ColumnResponse = "Response"
	ColumnText     = "Text"
)

func alignmentCell(xl *excelize.File, sheet string, col string, alignmentH string, alignmentV string) {
	styleID, _ := xl.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{
			Horizontal: alignmentH,
			Vertical:   alignmentV,
			WrapText:   true,
		},
	})
	_ = xl.SetColStyle(sheet, col, styleID)
}

type Column struct {
	Header          string
	Letter          string
	Width           float64
	HorizontalAlign string
	VerticalAlign   string
}

type Columns struct {
	NameToColumn map[string]int
	Columns      []Column
}

func (columns *Columns) addColumn(column Column) {
	total := len(columns.Columns)
	column.Letter = string(rune('A' + total))
	columns.Columns = append(columns.Columns, column)
	columns.NameToColumn[column.Header] = total
}

func (columns *Columns) getColumn(header string) Column {
	return columns.Columns[columns.NameToColumn[header]]
}

func renderReport(customer *mongo.Customer, assessment *mongo.Assessment, vulnerabilities []mongo.Vulnerability) ([]byte, error) {
	var zipBuf bytes.Buffer
	zipWriter := zip.NewWriter(&zipBuf)
	defer zipWriter.Close()

	screenDir := "Screenshots"
	zipWriter.AddDirectory(screenDir)

	xl := excelize.NewFile()
	defer xl.Close()

	// Create main sheet
	vulnSheet := "Vulnerabilities"
	pocSheet := "PoC"
	xl.NewSheet(vulnSheet)
	xl.NewSheet(pocSheet)
	xl.DeleteSheet("Sheet1")

	// Set document properties
	xl.SetDocProps(&excelize.DocProperties{
		Title:   assessment.Name,
		Subject: assessment.Type.Full,
		Creator: "Kryvea",
	})

	vulnColumns := &Columns{
		NameToColumn: make(map[string]int),
	}
	vulnColumns.addColumn(Column{
		Header: ColumnID,
		// Letter:          "A",
		Width:           15,
		HorizontalAlign: "center",
		VerticalAlign:   "center",
	})
	vulnColumns.addColumn(Column{
		Header: ColumnSeverity,
		// Letter:          "B",
		Width:           15,
		HorizontalAlign: "center",
		VerticalAlign:   "center",
	})
	vulnColumns.addColumn(Column{
		Header: ColumnStatus,
		// Letter:          "C",
		Width:           15,
		HorizontalAlign: "center",
		VerticalAlign:   "center",
	})
	vulnColumns.addColumn(Column{
		Header: ColumnName,
		// Letter:          "D",
		Width:           35,
		HorizontalAlign: "left",
		VerticalAlign:   "center",
	})
	vulnColumns.addColumn(Column{
		Header: ColumnIntro,
		// Letter:          "E",
		Width:           40,
		HorizontalAlign: "left",
		VerticalAlign:   "center",
	})
	vulnColumns.addColumn(Column{
		Header: ColumnDescription,
		// Letter:          "F",
		Width:           40,
		HorizontalAlign: "left",
		VerticalAlign:   "center",
	})
	vulnColumns.addColumn(Column{
		Header: ColumnPOC,
		// Letter:          "G",
		Width:           25,
		HorizontalAlign: "center",
		VerticalAlign:   "center",
	})

	for cvssVersion, enabled := range assessment.CVSSVersions {
		if !enabled {
			continue
		}

		vulnColumns.addColumn(Column{
			Header:          fmt.Sprintf("CVSSv%s Vector", cvssVersion),
			Width:           45,
			HorizontalAlign: "center",
			VerticalAlign:   "center",
		})
		vulnColumns.addColumn(Column{
			Header:          fmt.Sprintf("CVSSv%s Score", cvssVersion),
			Width:           30,
			HorizontalAlign: "center",
			VerticalAlign:   "center",
		})
	}

	vulnColumns.addColumn(Column{
		Header:          ColumnRemediation,
		Width:           40,
		HorizontalAlign: "left",
		VerticalAlign:   "center",
	})
	vulnColumns.addColumn(Column{
		Header:          ColumnReferences,
		Width:           40,
		HorizontalAlign: "left",
		VerticalAlign:   "center",
	})

	pocColumns := &Columns{
		NameToColumn: make(map[string]int),
	}
	pocColumns.addColumn(Column{
		Header: ColumnVulnID,
		// Letter:          "A",
		Width:           15,
		HorizontalAlign: "center",
		VerticalAlign:   "center",
	})
	pocColumns.addColumn(Column{
		Header: ColumnPOCID,
		// Letter:          "B",
		Width:           25,
		HorizontalAlign: "center",
		VerticalAlign:   "center",
	})
	pocColumns.addColumn(Column{
		Header: ColumnNotes,
		// Letter:          "C",
		Width:           40,
		HorizontalAlign: "center",
		VerticalAlign:   "center",
	})
	pocColumns.addColumn(Column{
		Header: ColumnRequest,
		// Letter:          "D",
		Width:           50,
		HorizontalAlign: "left",
		VerticalAlign:   "top",
	})
	pocColumns.addColumn(Column{
		Header: ColumnResponse,
		// Letter:          "E",
		Width:           50,
		HorizontalAlign: "left",
		VerticalAlign:   "top",
	})
	pocColumns.addColumn(Column{
		Header: ColumnText,
		// Letter:          "F",
		Width:           50,
		HorizontalAlign: "left",
		VerticalAlign:   "top",
	})

	// Set column widths and alignment
	for _, column := range vulnColumns.Columns {
		xl.SetColWidth(vulnSheet, column.Letter, column.Letter, column.Width)
		alignmentCell(xl, vulnSheet, column.Letter, column.HorizontalAlign, column.VerticalAlign)
	}

	for _, column := range pocColumns.Columns {
		xl.SetColWidth(pocSheet, column.Letter, column.Letter, column.Width)
		alignmentCell(xl, pocSheet, column.Letter, column.HorizontalAlign, column.VerticalAlign)
	}

	// Define header style
	headStyle, _ := xl.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{
			Horizontal: "center",
			Vertical:   "center",
		},
		Font: &excelize.Font{
			Bold:   true,
			Family: "Calibri",
			Size:   11,
			Color:  "FFFFFF",
		},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"FF6600"}, Pattern: 1},
	})

	for _, column := range vulnColumns.Columns {
		cell := fmt.Sprintf("%s1", column.Letter)
		xl.SetCellValue(vulnSheet, cell, column.Header)
		xl.SetCellStyle(vulnSheet, cell, cell, headStyle)
	}

	for _, column := range pocColumns.Columns {
		cell := fmt.Sprintf("%s1", column.Letter)
		xl.SetCellValue(pocSheet, cell, column.Header)
		xl.SetCellStyle(pocSheet, cell, cell, headStyle)
	}

	pocRow := 2

	for i, vuln := range vulnerabilities {
		row := i + 2
		xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(ColumnID).Letter, row), i)

		maxVersion := util.GetMaxCvssVersion(assessment.CVSSVersions)

		severity := ""
		switch maxVersion {
		case cvss.Cvss2:
			severity = vuln.CVSSv2.Severity.Label
		case cvss.Cvss3:
			severity = vuln.CVSSv3.Severity.Label
		case cvss.Cvss31:
			severity = vuln.CVSSv31.Severity.Label
		case cvss.Cvss4:
			severity = vuln.CVSSv4.Severity.Label
		}
		xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(ColumnSeverity).Letter, row), severity)

		xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(ColumnStatus).Letter, row), vuln.Status)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(ColumnName).Letter, row), fmt.Sprintf("%s: %s", vuln.Category.Name, vuln.DetailedTitle))
		xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(ColumnIntro).Letter, row), vuln.GenericDescription.Text)

		description := vuln.Description
		pocEntries := []string{}
		pocCount := 0

		// TODO: embed poc inside vulnerability
		// Process PoCs for this vulnerability
		for _, pocItem := range vuln.Poc.Pocs {
			// Append new PoCs at the end
			pocID := fmt.Sprintf("POC_%d_%d", i, pocCount)

			xl.SetCellValue(pocSheet, fmt.Sprintf("%s%d", pocColumns.getColumn(ColumnVulnID).Letter, pocRow), i)
			xl.SetCellValue(pocSheet, fmt.Sprintf("%s%d", pocColumns.getColumn(ColumnPOCID).Letter, pocRow), pocID)

			// Update description with PoC references
			if pocItem.Description != "" {
				description += fmt.Sprintf("\n\n%s\n\n%s", pocItem.Description, pocID)
			} else {
				description += fmt.Sprintf("\n\n%s", pocID)
			}

			switch pocItem.Type {
			case "image":
				imagePath := fmt.Sprintf("%s/POC_%d_%d.PNG", screenDir, i, pocCount)

				// add image to the zip
				zipWriter.AddFile(bytes.NewBuffer(pocItem.ImageData), imagePath)

				xl.SetCellValue(pocSheet, fmt.Sprintf("%s%d", pocColumns.getColumn(ColumnNotes).Letter, pocRow), fmt.Sprintf("%s\n\n%s | %s", pocItem.Description, filepath.Base(imagePath), pocItem.ImageCaption))
			case "request":
				xl.SetCellValue(pocSheet, fmt.Sprintf("%s%d", pocColumns.getColumn(ColumnRequest).Letter, pocRow), pocItem.Request)
				xl.SetCellValue(pocSheet, fmt.Sprintf("%s%d", pocColumns.getColumn(ColumnResponse).Letter, pocRow), pocItem.Response)

			case "text":
				xl.SetCellValue(pocSheet, fmt.Sprintf("%s%d", pocColumns.getColumn(ColumnText).Letter, pocRow), pocItem.TextData)
			}

			pocEntries = append(pocEntries, pocID)
			pocCount++
			pocRow++
		}

		xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(ColumnDescription).Letter, row), description)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(ColumnPOC).Letter, row), strings.Join(pocEntries, "\n"))
		for assessmentCvssVersion, enabled := range assessment.CVSSVersions {
			if !enabled {
				continue
			}

			switch assessmentCvssVersion {
			case cvss.Cvss2:
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Vector", assessmentCvssVersion)).Letter, row), vuln.CVSSv2.Vector)
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Score", assessmentCvssVersion)).Letter, row), vuln.CVSSv2.Score)
			case cvss.Cvss3:
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Vector", assessmentCvssVersion)).Letter, row), vuln.CVSSv3.Vector)
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Score", assessmentCvssVersion)).Letter, row), vuln.CVSSv3.Score)
			case cvss.Cvss31:
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Vector", assessmentCvssVersion)).Letter, row), vuln.CVSSv31.Vector)
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Score", assessmentCvssVersion)).Letter, row), vuln.CVSSv31.Score)
			case cvss.Cvss4:
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Vector", assessmentCvssVersion)).Letter, row), vuln.CVSSv4.Vector)
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Score", assessmentCvssVersion)).Letter, row), vuln.CVSSv4.Score)
			}
		}
		xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(ColumnRemediation).Letter, row), vuln.Remediation)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(ColumnReferences).Letter, row), strings.Join(vuln.References, "\n"))
	}

	baseFileName := fmt.Sprintf("STAP - %s - %s - %s - v1.0", assessment.Type.Short, customer.Name, assessment.Name)
	baseFileName = sanitizeFileName(baseFileName)

	zipWriter.AddExcelize(xl, baseFileName)

	zipWriter.Close()

	return zipBuf.Bytes(), nil
}

func sanitizeFileName(name string) string {
	// Replace invalid characters with underscores
	replacer := strings.NewReplacer(
		"/", "_",
		"\\", "_",
		":", "_",
		"*", "_",
		"?", "_",
		"<", "_",
		">", "_",
		"|", "_",
	)
	return replacer.Replace(name)
}

type CustomClassicTemplate struct{}

func NewCustomClassicTemplate() (*CustomClassicTemplate, error) {
	return &CustomClassicTemplate{}, nil
}

// TODO: try writing directly to ResponseWriter, instead of returning bytes
func (t CustomClassicTemplate) Render(reportData *reportdata.ReportData) ([]byte, error) {
	// Sort assessment.CVSSVersions
	maxVersion := util.GetMaxCvssVersion(reportData.Assessment.CVSSVersions)

	// Sort vulnerabilities by score. if score is equal, sort by name in ascending order
	// TODO: simplify by creating  Vulnerability.CVSS as map[string]VulnerabilityCVSS
	// and then using vulnerabilities[i][maxVersion].CVSSScore
	switch maxVersion {
	case cvss.Cvss2:
		sort.Slice(reportData.Vulnerabilities, func(i, j int) bool {
			if reportData.Vulnerabilities[i].CVSSv2.Score == reportData.Vulnerabilities[j].CVSSv2.Score {
				return reportData.Vulnerabilities[i].DetailedTitle < reportData.Vulnerabilities[j].DetailedTitle
			}
			return reportData.Vulnerabilities[i].CVSSv2.Score > reportData.Vulnerabilities[j].CVSSv2.Score
		})
	case cvss.Cvss3:
		sort.Slice(reportData.Vulnerabilities, func(i, j int) bool {
			if reportData.Vulnerabilities[i].CVSSv3.Score == reportData.Vulnerabilities[j].CVSSv3.Score {
				return reportData.Vulnerabilities[i].DetailedTitle < reportData.Vulnerabilities[j].DetailedTitle
			}
			return reportData.Vulnerabilities[i].CVSSv3.Score > reportData.Vulnerabilities[j].CVSSv3.Score
		})
	case cvss.Cvss31:
		sort.Slice(reportData.Vulnerabilities, func(i, j int) bool {
			if reportData.Vulnerabilities[i].CVSSv31.Score == reportData.Vulnerabilities[j].CVSSv31.Score {
				return reportData.Vulnerabilities[i].DetailedTitle < reportData.Vulnerabilities[j].DetailedTitle
			}
			return reportData.Vulnerabilities[i].CVSSv31.Score > reportData.Vulnerabilities[j].CVSSv31.Score
		})
	case cvss.Cvss4:
		sort.Slice(reportData.Vulnerabilities, func(i, j int) bool {
			if reportData.Vulnerabilities[i].CVSSv4.Score == reportData.Vulnerabilities[j].CVSSv4.Score {
				return reportData.Vulnerabilities[i].DetailedTitle < reportData.Vulnerabilities[j].DetailedTitle
			}
			return reportData.Vulnerabilities[i].CVSSv4.Score > reportData.Vulnerabilities[j].CVSSv4.Score
		})
	}

	// Sort poc.Pocs for each poc in pocs
	for i := range reportData.Vulnerabilities {

		sort.Slice(reportData.Vulnerabilities[i].Poc.Pocs, func(i, j int) bool {
			return reportData.Vulnerabilities[i].Poc.Pocs[i].Index < reportData.Vulnerabilities[i].Poc.Pocs[j].Index
		})

	}

	return renderReport(reportData.Customer, reportData.Assessment, reportData.Vulnerabilities)
}
