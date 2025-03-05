package xlsx

import (
	"testing"
	"time"

	"github.com/Alexius22/kryvea/internal/mongo"
)

func TestXlsx(t *testing.T) {
	customer := &mongo.Customer{
		Name:               "Test Customer",
		Language:           "en",
		DefaultCVSSVersion: "3.1",
	}

	assessment := &mongo.Assessment{
		Name:          "Test Assessment",
		StartDateTime: time.Now().Add(-time.Hour * 24 * 7),
		EndDateTime:   time.Now(),
		Targets: []mongo.AssessmentTarget{
			{IP: "10.10.10.10", Hostname: "test-host"},
			{IP: "10.10.1.01", Hostname: "test-host-2"},
		},
		Status:             "completed",
		AssessmentType:     "WAPT",
		CVSSVersion:        "3.1",
		Environment:        "Production",
		TestingType:        "Black Box",
		OSSTMMVector:       "Inside to Inside",
		VulnerabilityCount: 1,
	}

	vulnerability := &mongo.Vulnerability{
		Category:        mongo.VulnerabilityCategory{Name: "Test Category"},
		DetailedTitle:   "Test Vulnerability",
		CVSSVector:      "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
		CVSSScore:       9.8,
		CVSSSeverity:    "Critical",
		CVSSDescription: "CVSS description",
		References: []string{
			"https://test.com",
			"https://test2.com",
		},
		GenericDescription: mongo.VulnerabilityGeneric{
			Text: "GenericDescription",
		},
		GenericRemediation: mongo.VulnerabilityGeneric{
			Text: "GenericRemediation",
		},
		Description: "Description",
		Remediation: "Remediation",
		Target: mongo.VulnerabilityTarget{
			IP: "10.10.10.10", Hostname: "test-host",
		},
	}

	vulnerabilities := []mongo.Vulnerability{*vulnerability}

	poc := &mongo.Poc{
		Index:       1,
		Type:        "HTTP",
		Description: "Test POC",
		URI:         "https://test.com",
		Request:     "GET /api/customers/67bf90ecc62240d76dc5002a/assessments HTTP/1.1\nHost: kryvea.local\nUser-Agent: curl/8.10.1\nCookie: kryvea=7b9230fc-ba47-460a-a236-ef5a70d85263\nAccept: */*\nConnection: keep-alive\n",
		Response:    "HTTP/1.1 200 OK",
	}

	pocs := []mongo.Poc{*poc}

	t.Run("test", func(t *testing.T) {
		_, err := GenerateReport(customer, assessment, vulnerabilities, pocs)
		if err != nil {
			t.Errorf("GenerateReport() = %v, want %v", err, true)
		}
	})
}
