package xlsx

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
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

func renderReport(customer *mongo.Customer, assessment *mongo.Assessment, vulnerabilities []mongo.Vulnerability, pocs []mongo.Poc) (string, error) {
	//timestamp := time.Now().Format("20060102_150405")
	fileName := fmt.Sprintf("STAP - %s - %s - %s - v1.0.xlsx", assessment.AssessmentType, customer.Name, assessment.Name)
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
		Title:    "Report Title",
		Subject:  "Report Subject",
		Keywords: "security, assessment",
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
	headers := []string{"ID", "Severity", "Status", "Name", "Introduction", "Description", "Proof of Concept", "CVSSv3.1 Vector", "CVSSv3.1 Score", "Remediations", "References"}
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

	// Populate vulnerabilities
	for i, vuln := range vulnerabilities {
		row := i + 2
		xl.SetCellValue(vulnSheet, fmt.Sprintf("A%d", row), i)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("B%d", row), vuln.CVSSSeverity)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("C%d", row), "Open")
		xl.SetCellValue(vulnSheet, fmt.Sprintf("D%d", row), fmt.Sprintf("%s: %s", vuln.Category.Name, vuln.DetailedTitle))
		xl.SetCellValue(vulnSheet, fmt.Sprintf("E%d", row), vuln.GenericDescription.Text)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("F%d", row), vuln.Description)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("G%d", row), "POC_0_0")
		xl.SetCellValue(vulnSheet, fmt.Sprintf("H%d", row), vuln.CVSSVector)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("I%d", row), vuln.CVSSScore)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("J%d", row), vuln.Remediation)
		xl.SetCellValue(vulnSheet, fmt.Sprintf("K%d", row), strings.Join(vuln.References[:], "\n"))
	}

	// Populate PoCs
	for i, poc := range pocs {
		row := i + 2
		xl.SetCellValue(pocSheet, fmt.Sprintf("A%d", row), i)
		xl.SetCellValue(pocSheet, fmt.Sprintf("B%d", row), fmt.Sprintf("POC_0_0\n%s", poc.ImageCaption))
		xl.SetCellValue(pocSheet, fmt.Sprintf("C%d", row), poc.Description)
		xl.SetCellValue(pocSheet, fmt.Sprintf("D%d", row), poc.Request)
		xl.SetCellValue(pocSheet, fmt.Sprintf("E%d", row), poc.Response)
		xl.SetCellValue(pocSheet, fmt.Sprintf("F%d", row), poc.TextData)
	}

	// Save the file
	if err := xl.SaveAs(fileName); err != nil {
		return "", err
	}

	// Create ZIP file
	zipName := fmt.Sprintf("STAP - %s - %s - %s - v1.0.zip", assessment.AssessmentType, customer.Name, assessment.Name)
	zipFile, err := os.Create(zipName)
	if err != nil {
		return "", err
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	fileToZip, err := os.Open(fileName)
	if err != nil {
		return "", err
	}
	defer fileToZip.Close()

	info, err := fileToZip.Stat()
	if err != nil {
		return "", err
	}

	header, err := zip.FileInfoHeader(info)
	if err != nil {
		return "", err
	}
	header.Method = zip.Deflate

	writer, err := zipWriter.CreateHeader(header)
	if err != nil {
		return "", err
	}

	_, err = io.Copy(writer, fileToZip)
	if err != nil {
		return "", err
	}

	return zipName, nil
}

// TODO: A major refactoring is needed on the DB functions that should return arrays of pointers instead of arrays of values
// This function should then be refactored to accept arrays of pointers for the vulnerabilities and pocs
func GenerateReport(customer *mongo.Customer, assessment *mongo.Assessment, vulnerabilities []mongo.Vulnerability, pocs []mongo.Poc) (string, error) {
	return renderReport(customer, assessment, vulnerabilities, pocs)
}
