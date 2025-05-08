package xlsx

import (
	"archive/zip"
	"encoding/base64"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/xuri/excelize/v2"
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

func renderReport(customer *mongo.Customer, assessment *mongo.Assessment, vulnerabilities []mongo.Vulnerability, pocs []mongo.Poc) (string, error) {
	//timestamp := time.Now().Format("20060102_150405")
	fileName := fmt.Sprintf("STAP - %s - %s - %s - v1.0.xlsx", assessment.AssessmentType, customer.Name, assessment.Name)
	fileName = sanitizeFileName(fileName)
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
		Subject: assessment.AssessmentType,
		Creator: "Kryvea",
	})

	// Set column widths
	colWidthsVuln := []float64{15, 15, 15, 35, 40, 40, 25, 45, 30, 40, 40}
	for i, width := range colWidthsVuln {
		col := string(rune('A' + i))
		xl.SetColWidth(vulnSheet, col, col, width)
	}

	colWidthsPoc := []float64{15, 25, 40, 50, 50, 50}
	for i, width := range colWidthsPoc {
		col := string(rune('A' + i))
		xl.SetColWidth(pocSheet, col, col, width)
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

	// Apply alignment style
	for _, col := range []string{"D", "E", "F"} {
		alignmentCell(xl, pocSheet, col, "left", "top")
	}

	for _, col := range []string{"D", "E", "F", "J"} {
		alignmentCell(xl, vulnSheet, col, "left", "center")
	}

	alignmentCell(xl, vulnSheet, "K", "left", "center")

	for _, col := range []string{"A", "B", "C", "F"} {
		alignmentCell(xl, pocSheet, col, "center", "center")
	}

	for _, col := range []string{"A", "B", "C", "G", "H", "I"} {
		alignmentCell(xl, vulnSheet, col, "center", "center")
	}

	// Header row
	headers := []string{"ID", "Severity", "Status", "Name", "Introduction", "Description", "Proof of Concept", fmt.Sprintf("CVSSv%s Vector", assessment.CVSSVersion), fmt.Sprintf("CVSSv%s Score", assessment.CVSSVersion), "Remediations", "References"}
	for i, header := range headers {
		cell := fmt.Sprintf("%c1", 'A'+i)
		xl.SetCellValue(vulnSheet, cell, header)
		xl.SetCellStyle(vulnSheet, cell, cell, headStyle)
	}

	// PoC headers
	pocHeaders := []string{"Vuln ID", "POC ID", "Note", "Request", "Response", "Text"}
	for i, header := range pocHeaders {
		cell := fmt.Sprintf("%c1", 'A'+i)
		xl.SetCellValue(pocSheet, cell, header)
		xl.SetCellStyle(pocSheet, cell, cell, headStyle)
	}

	tmpDir, err := os.MkdirTemp(".", "prefix-")
	pocRow := 2

	// sort vulnerabilities by score. if score is equal, sort by name in ascending order
	sort.Slice(vulnerabilities, func(i, j int) bool {
		if vulnerabilities[i].CVSSReport.CVSSScore == vulnerabilities[j].CVSSReport.CVSSScore {
			return vulnerabilities[i].DetailedTitle < vulnerabilities[j].DetailedTitle
		}
		return vulnerabilities[i].CVSSReport.CVSSScore > vulnerabilities[j].CVSSReport.CVSSScore
	})

	for i, vuln := range vulnerabilities {
		row := i + 2
		xl.SetCellValue(vulnSheet, fmt.Sprintf("A%d", row), i)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("B%d", row), vuln.CVSSReport.CVSSSeverity)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("C%d", row), "Open")
		xl.SetCellValue(vulnSheet, fmt.Sprintf("D%d", row), fmt.Sprintf("%s: %s", vuln.Category.Name, vuln.DetailedTitle))
		xl.SetCellValue(vulnSheet, fmt.Sprintf("E%d", row), vuln.GenericDescription.Text)

		description := vuln.Description
		pocEntries := []string{}
		pocCount := 0

		// Process PoCs for this vulnerability
		for _, poc := range pocs {
			if poc.VulnerabilityID != vuln.ID {
				continue
			}
			// Append new PoCs at the end
			pocID := fmt.Sprintf("POC_%d_%d", i, pocCount)

			xl.SetCellValue(pocSheet, fmt.Sprintf("A%d", pocRow), i)
			xl.SetCellValue(pocSheet, fmt.Sprintf("B%d", pocRow), pocID)

			// Update description with PoC references
			if poc.Description != "" {
				description += fmt.Sprintf("\n\n%s\n\n%s", poc.Description, pocID)
			} else {
				description += fmt.Sprintf("\n\n%s", pocID)
			}

			switch poc.Type {
			case "image":
				imagePath := fmt.Sprintf("%s/POC_%d_%d.PNG", tmpDir, i, pocCount)
				// create image file
				imageFile, err := os.Create(imagePath)
				if err != nil {
					continue
				}
				defer imageFile.Close()

				// base64 decode image data
				decodedImage, err := base64.StdEncoding.DecodeString(poc.ImageData)
				if err != nil {
					continue
				}

				// copy imagedata to file
				_, err = imageFile.Write(decodedImage)
				if err != nil {
					continue
				}

				xl.SetCellValue(pocSheet, fmt.Sprintf("C%d", pocRow), fmt.Sprintf("%s\n\n%s | %s", poc.Description, filepath.Base(imagePath), poc.ImageCaption))
			case "request":
				xl.SetCellValue(pocSheet, fmt.Sprintf("D%d", pocRow), poc.Request)
				xl.SetCellValue(pocSheet, fmt.Sprintf("E%d", pocRow), poc.Response)

			case "text":
				xl.SetCellValue(pocSheet, fmt.Sprintf("F%d", pocRow), poc.TextData)
			}

			pocEntries = append(pocEntries, pocID)
			pocCount++
			pocRow++
		}

		xl.SetCellValue(vulnSheet, fmt.Sprintf("F%d", row), description)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("G%d", row), strings.Join(pocEntries, "\n"))
		xl.SetCellValue(vulnSheet, fmt.Sprintf("H%d", row), vuln.CVSSReport.CVSSVector)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("I%d", row), vuln.CVSSReport.CVSSScore)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("J%d", row), vuln.Remediation)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("K%d", row), strings.Join(vuln.References, "\n"))
	}

	// Save the file
	if err := xl.SaveAs(fileName); err != nil {
		return "", err
	}

	// Create ZIP file
	zipName := fmt.Sprintf("STAP - %s - %s - %s - v1.0.zip", assessment.AssessmentType, customer.Name, assessment.Name)
	zipName = sanitizeFileName(zipName)
	zipFile, err := os.Create(zipName)
	if err != nil {
		fmt.Println("Error creating ZIP:", err)
		return "", err
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	// Add the primary file to the ZIP
	if err := addFileToZip(zipWriter, fileName, filepath.Base(fileName)); err != nil {
		fmt.Println("Error adding file:", err)
		return "", err
	}

	// Rename tmpDir to Screenshots
	screenDir := "Screenshots"
	if err := os.Rename(tmpDir, screenDir); err != nil {
		fmt.Println("Error renaming directory:", err)
		return "", err
	}

	// Add the Screenshots directory (including contents) to the ZIP
	if err := addFileToZip(zipWriter, screenDir, screenDir); err != nil {
		fmt.Println("Error adding screenshots directory:", err)
		return "", err
	}

	// Cleanup temp files
	os.Remove(fileName)
	os.RemoveAll(screenDir)

	fmt.Println("ZIP created:", zipName)
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

func GenerateReport(customer *mongo.Customer, assessment *mongo.Assessment, vulnerabilities []mongo.Vulnerability, pocs []mongo.Poc) (string, error) {
	return renderReport(customer, assessment, vulnerabilities, pocs)
}
