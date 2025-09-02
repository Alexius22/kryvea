package xlsx

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
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

// addFileToZip adds a file or directory (recursively) to the ZIP archive
func addFileToZip(zipWriter *zip.Writer, filePath, baseInZip string) error {
	info, err := os.Stat(filePath)
	if err != nil {
		return err
	}

	// If it's a directory, create a folder entry and recursively add contents
	if info.IsDir() {
		// Create a directory entry in the ZIP
		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}
		header.Name = baseInZip + "/"
		header.Method = zip.Store

		_, err = zipWriter.CreateHeader(header)
		if err != nil {
			return err
		}

		// Walk through directory contents and add them to the ZIP
		entries, err := os.ReadDir(filePath)
		if err != nil {
			return err
		}

		for _, entry := range entries {
			newPath := filepath.Join(filePath, entry.Name())
			newBase := filepath.Join(baseInZip, entry.Name())
			if err := addFileToZip(zipWriter, newPath, newBase); err != nil {
				return err
			}
		}
		return nil
	}

	// Handle file case
	fileToZip, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer fileToZip.Close()

	header, err := zip.FileInfoHeader(info)
	if err != nil {
		return err
	}
	header.Method = zip.Deflate
	header.Name = baseInZip // Preserve folder structure inside ZIP

	writer, err := zipWriter.CreateHeader(header)
	if err != nil {
		return err
	}

	_, err = io.Copy(writer, fileToZip)
	return err
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

func renderReport(customer *mongo.Customer, assessment *mongo.Assessment, vulnerabilities []mongo.Vulnerability, pocs []mongo.Poc) (string, error) {
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

	tmpDir, err := os.MkdirTemp(".", "prefix-")
	if err != nil {
		return "", err
	}
	pocRow := 2

	for i, vuln := range vulnerabilities {
		row := i + 2
		xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(ColumnID).Letter, row), i)

		maxVersion := ""
		for cvssVersion, enabled := range assessment.CVSSVersions {
			if !enabled {
				continue
			}

			if cvssVersion > maxVersion {
				maxVersion = cvssVersion
			}
		}

		fmt.Println("maxversion", maxVersion)

		severity := ""
		switch maxVersion {
		case cvss.Cvss2:
			severity = vuln.CVSSv2.CVSSSeverity
		case cvss.Cvss3:
			severity = vuln.CVSSv3.CVSSSeverity
		case cvss.Cvss31:
			severity = vuln.CVSSv31.CVSSSeverity
		case cvss.Cvss4:
			severity = vuln.CVSSv4.CVSSSeverity
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
		for _, poc := range pocs {
			if poc.VulnerabilityID != vuln.ID {
				continue
			}
			for _, pocItem := range poc.Pocs {
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
					imagePath := fmt.Sprintf("%s/POC_%d_%d.PNG", tmpDir, i, pocCount)
					// create image file
					imageFile, err := os.Create(imagePath)
					if err != nil {
						continue
					}
					defer imageFile.Close()

					// TODO: remove
					// // base64 decode image data
					// decodedImage, err := base64.StdEncoding.DecodeString(poc.ImageData)
					// if err != nil {
					// 	continue
					// }

					// copy imagedata to file
					_, err = imageFile.Write(pocItem.ImageData)
					if err != nil {
						continue
					}

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
		}

		xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(ColumnDescription).Letter, row), description)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(ColumnPOC).Letter, row), strings.Join(pocEntries, "\n"))
		for assessmentCvssVersion, enabled := range assessment.CVSSVersions {
			if !enabled {
				continue
			}

			switch assessmentCvssVersion {
			case cvss.Cvss2:
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Vector", assessmentCvssVersion)).Letter, row), vuln.CVSSv2.CVSSVector)
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Score", assessmentCvssVersion)).Letter, row), vuln.CVSSv2.CVSSScore)
			case cvss.Cvss3:
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Vector", assessmentCvssVersion)).Letter, row), vuln.CVSSv3.CVSSVector)
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Score", assessmentCvssVersion)).Letter, row), vuln.CVSSv3.CVSSScore)
			case cvss.Cvss31:
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Vector", assessmentCvssVersion)).Letter, row), vuln.CVSSv31.CVSSVector)
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Score", assessmentCvssVersion)).Letter, row), vuln.CVSSv31.CVSSScore)
			case cvss.Cvss4:
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Vector", assessmentCvssVersion)).Letter, row), vuln.CVSSv4.CVSSVector)
				xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(fmt.Sprintf("CVSSv%s Score", assessmentCvssVersion)).Letter, row), vuln.CVSSv4.CVSSScore)
			}
		}
		xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(ColumnRemediation).Letter, row), vuln.Remediation)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("%s%d", vulnColumns.getColumn(ColumnReferences).Letter, row), strings.Join(vuln.References, "\n"))
	}

	baseFileName := fmt.Sprintf("STAP - %s - %s - %s - v1.0", assessment.Type, customer.Name, assessment.Name)
	baseFileName = sanitizeFileName(baseFileName)

	// Save XLSX file
	fileName := baseFileName + ".xlsx"
	if err := xl.SaveAs(fileName); err != nil {
		return "", err
	}

	// Create ZIP file
	zipName := baseFileName + ".zip"
	zipFile, err := os.Create(zipName)
	if err != nil {
		return "", err
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	// Add the primary file to the ZIP
	if err := addFileToZip(zipWriter, fileName, filepath.Base(fileName)); err != nil {
		return "", err
	}

	// Rename tmpDir to Screenshots
	screenDir := "Screenshots"
	if err := os.Rename(tmpDir, screenDir); err != nil {
		return "", err
	}

	// Add the Screenshots directory (including contents) to the ZIP
	if err := addFileToZip(zipWriter, screenDir, screenDir); err != nil {
		return "", err
	}

	// Cleanup temp files
	os.Remove(fileName)
	os.RemoveAll(screenDir)

	return zipName, nil
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

func GenerateReportClassic(customer *mongo.Customer, assessment *mongo.Assessment, vulnerabilities []mongo.Vulnerability, pocs []mongo.Poc) (string, error) {
	// Sort assessment.CVSSVersions
	maxVersion := ""
	for cvssVersion, enabled := range assessment.CVSSVersions {
		if !enabled {
			continue
		}
		if cvssVersion > maxVersion {
			maxVersion = cvssVersion
		}
	}

	// Sort vulnerabilities by score. if score is equal, sort by name in ascending order
	// TODO: simplify by creating  Vulnerability.CVSS as map[string]VulnerabilityCVSS
	// and then using vulnerabilities[i][maxVersion].CVSSScore
	switch maxVersion {
	case cvss.Cvss2:
		sort.Slice(vulnerabilities, func(i, j int) bool {
			if vulnerabilities[i].CVSSv2.CVSSScore == vulnerabilities[j].CVSSv2.CVSSScore {
				return vulnerabilities[i].DetailedTitle < vulnerabilities[j].DetailedTitle
			}
			return vulnerabilities[i].CVSSv2.CVSSScore > vulnerabilities[j].CVSSv2.CVSSScore
		})
	case cvss.Cvss3:
		sort.Slice(vulnerabilities, func(i, j int) bool {
			if vulnerabilities[i].CVSSv3.CVSSScore == vulnerabilities[j].CVSSv3.CVSSScore {
				return vulnerabilities[i].DetailedTitle < vulnerabilities[j].DetailedTitle
			}
			return vulnerabilities[i].CVSSv3.CVSSScore > vulnerabilities[j].CVSSv3.CVSSScore
		})
	case cvss.Cvss31:
		sort.Slice(vulnerabilities, func(i, j int) bool {
			if vulnerabilities[i].CVSSv31.CVSSScore == vulnerabilities[j].CVSSv31.CVSSScore {
				return vulnerabilities[i].DetailedTitle < vulnerabilities[j].DetailedTitle
			}
			return vulnerabilities[i].CVSSv31.CVSSScore > vulnerabilities[j].CVSSv31.CVSSScore
		})
	case cvss.Cvss4:
		sort.Slice(vulnerabilities, func(i, j int) bool {
			if vulnerabilities[i].CVSSv4.CVSSScore == vulnerabilities[j].CVSSv4.CVSSScore {
				return vulnerabilities[i].DetailedTitle < vulnerabilities[j].DetailedTitle
			}
			return vulnerabilities[i].CVSSv4.CVSSScore > vulnerabilities[j].CVSSv4.CVSSScore
		})
	}

	// Sort poc.Pocs for each poc in pocs
	for i := range pocs {
		sort.Slice(pocs[i].Pocs, func(i, j int) bool {
			return pocs[i].Pocs[i].Index < pocs[i].Pocs[j].Index
		})
	}

	return renderReport(customer, assessment, vulnerabilities, pocs)
}
