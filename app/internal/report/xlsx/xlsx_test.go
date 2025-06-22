package xlsx

import (
	"encoding/base64"
	"fmt"
	"math/rand"
	"testing"
	"time"

	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/google/uuid"
)

const (
	imageData = "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"
)

func randName(n int) string {
	var names = []string{"Ace", "Blaze", "Nova", "Zane", "Kai", "Orion", "Jett", "Echo", "Maverick", "Axel", "Ryder", "Phoenix", "Storm", "Dash", "Sable", "Ember", "Zephyr", "Titan", "Knox", "Luna", "Indigo", "Raven", "Aspen", "Atlas", "Juno", "Onyx", "Sage", "Vega", "Zara", "Xander", "Aria", "Dante", "Hunter", "Skye", "Rogue", "Kairos", "Hawk", "Shadow", "Nyx", "Lyric"}

	var name string
	for i := 0; i < n; i++ {
		name += names[rand.Intn(len(names))]
		if i < n-1 {
			name += " "
		}
	}
	return name
}

func randLanguage() string {
	var languages = []string{"en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko"}
	return languages[rand.Intn(len(languages))]
}

func randIP() string {
	return fmt.Sprintf("%d.%d.%d.%d", rand.Intn(256), rand.Intn(256), rand.Intn(256), rand.Intn(256))
}

func randHostname() string {
	return fmt.Sprintf("%s.example.com", randName(1))
}

func randStatus() string {
	var statuses = []string{"On Hold", "In Progress", "Completed"}
	return statuses[rand.Intn(len(statuses))]
}

func randAssessmentType() string {
	var types = []string{"WAPT", "VAPT", "MAPT", "IoT", "Red Team Assessment"}
	return types[rand.Intn(len(types))]
}

func randCVSSVersion() string {
	return cvss.CVSSVersions[rand.Intn(len(cvss.CVSSVersions))]
}

func randEnvironment() string {
	var environments = []string{"Pre-Production", "Production"}
	return environments[rand.Intn(len(environments))]
}

func randTestingType() string {
	var types = []string{"Black Box", "White Box", "Gray Box"}
	return types[rand.Intn(len(types))]
}

func randOSSTMMVector() string {
	var vectors = []string{"Inside to Inside", "Inside to Outside", "Outside to Inside", "Outside to Outside"}
	return vectors[rand.Intn(len(vectors))]
}

func randCVSSVector(version string) string {
	switch version {
	case cvss.CVSS2:
		vectors := []string{
			"AV:N/AC:L/Au:N/C:N/I:N/A:C",
			"AV:N/AC:L/Au:N/C:P/I:N/A:C",
			"AV:N/AC:L/Au:N/C:C/I:N/A:C",
			"AV:N/AC:L/Au:N/C:C/I:C/A:C",
			"AV:N/AC:L/Au:N/C:C/I:C/A:N",
			"AV:N/AC:L/Au:N/C:C/I:N/A:N",
			"AV:N/AC:L/Au:N/C:P/I:P/A:C",
			"AV:N/AC:L/Au:N/C:P/I:P/A:N",
			"AV:N/AC:L/Au:N/C:P/I:N/A:C",
			"AV:N/AC:L/Au:N/C:P/I:N/A:N",
			"AV:N/AC:L/Au:N/C:N/I:P/A:C",
			"AV:N/AC:L/Au:N/C:N/I:P/A:N",
		}
		return vectors[rand.Intn(len(vectors))]
	case cvss.CVSS3:
		vectors := []string{
			"CVSS:3.0/AV:A/AC:H/PR:L/UI:N/S:C/C:L/I:L/A:L",
			"CVSS:3.0/AV:N/AC:H/PR:N/UI:R/S:U/C:N/I:L/A:H",
			"CVSS:3.0/AV:N/AC:H/PR:L/UI:R/S:C/C:L/I:L/A:H",
			"CVSS:3.0/AV:N/AC:H/PR:L/UI:R/S:C/C:L/I:H/A:N",
			"CVSS:3.0/AV:N/AC:H/PR:L/UI:N/S:C/C:L/I:L/A:N",
			"CVSS:3.0/AV:L/AC:H/PR:L/UI:N/S:U/C:N/I:L/A:N",
			"CVSS:3.0/AV:A/AC:H/PR:H/UI:N/S:U/C:N/I:H/A:N",
			"CVSS:3.0/AV:P/AC:H/PR:H/UI:N/S:C/C:N/I:L/A:N",
			"CVSS:3.0/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N",
			"CVSS:3.0/AV:A/AC:H/PR:L/UI:N/S:C/C:H/I:H/A:H",
		}
		return vectors[rand.Intn(len(vectors))]
	case cvss.CVSS31:
		vectors := []string{
			"CVSS:3.1/AV:A/AC:H/PR:L/UI:N/S:C/C:L/I:L/A:L",
			"CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:N/I:L/A:H",
			"CVSS:3.1/AV:N/AC:H/PR:L/UI:R/S:C/C:L/I:L/A:H",
			"CVSS:3.1/AV:N/AC:H/PR:L/UI:R/S:C/C:L/I:H/A:N",
			"CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:C/C:L/I:L/A:N",
			"CVSS:3.1/AV:L/AC:H/PR:L/UI:N/S:U/C:N/I:L/A:N",
			"CVSS:3.1/AV:A/AC:H/PR:H/UI:N/S:U/C:N/I:H/A:N",
			"CVSS:3.1/AV:P/AC:H/PR:H/UI:N/S:C/C:N/I:L/A:N",
			"CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N",
			"CVSS:3.1/AV:A/AC:H/PR:L/UI:N/S:C/C:H/I:H/A:H",
		}
		return vectors[rand.Intn(len(vectors))]
	case cvss.CVSS4:
		vectors := []string{
			"CVSS:4.0/AV:A/AC:H/AT:P/PR:L/UI:P/VC:L/VI:L/VA:L/SC:L/SI:L/SA:L",
			"CVSS:4.0/AV:A/AC:H/AT:N/PR:L/UI:P/VC:H/VI:H/VA:L/SC:L/SI:L/SA:L",
			"CVSS:4.0/AV:A/AC:H/AT:N/PR:L/UI:A/VC:H/VI:N/VA:L/SC:L/SI:H/SA:L",
			"CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:A/VC:H/VI:N/VA:L/SC:L/SI:H/SA:L",
			"CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:P/VC:H/VI:N/VA:L/SC:L/SI:H/SA:L",
			"CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:P/VC:H/VI:L/VA:L/SC:N/SI:H/SA:H",
		}
		return vectors[rand.Intn(len(vectors))]
	}

	return "CVSS:3.1/AV:A/AC:H/PR:L/UI:N/S:C/C:L/I:L/A:L"
}

func randUrl() string {
	var urls = []string{"https://example.com", "https://example.org", "https://example.net"}
	return urls[rand.Intn(len(urls))]
}

func TestXlsx(t *testing.T) {
	customer := &mongo.Customer{
		Name:                randName(3),
		Language:            randLanguage(),
		DefaultCVSSVersions: []string{cvss.CVSS2, cvss.CVSS4},
	}

	var targets []mongo.AssessmentTarget
	for i := 0; i < 2; i++ {
		targets = append(targets, mongo.AssessmentTarget{
			IPv4: randIP(), FQDN: randHostname(),
		})
	}

	assessment := &mongo.Assessment{
		Name:           randName(3),
		StartDateTime:  time.Now().Add(-time.Hour * 24 * 7),
		EndDateTime:    time.Now(),
		Targets:        targets,
		Status:         randStatus(),
		AssessmentType: randAssessmentType(),
		CVSSVersions:   customer.DefaultCVSSVersions,
		Environment:    randEnvironment(),
		TestingType:    randTestingType(),
		OSSTMMVector:   randOSSTMMVector(),
	}

	imageDataDecoded, err := base64.StdEncoding.DecodeString(imageData)
	if err != nil {
		t.Errorf("base64.StdEncoding.DecodeString() = %v, want %v", err, nil)
	}

	var vulnerabilities []mongo.Vulnerability
	var pocs []mongo.Poc
	for i := 0; i < 5; i++ {
		version := rand.Intn(len(assessment.CVSSVersions))
		cvssVector := randCVSSVector(assessment.CVSSVersions[version])
		cvssScore, cvssSeverity, err := cvss.ParseVector(cvssVector, assessment.CVSSVersions[version])
		if err != nil {
			t.Errorf("ParseVector() = %v, want %v, cvss version %s", err, nil, assessment.CVSSVersions[version])
		}

		vulnerability := mongo.Vulnerability{
			Model:         mongo.Model{ID: uuid.New()},
			Category:      mongo.VulnerabilityCategory{Name: randName(3)},
			DetailedTitle: randName(3),
			CVSSReport: mongo.VulnerabilityCVSS{
				CVSSVersion:     assessment.CVSSVersions[version],
				CVSSVector:      cvssVector,
				CVSSScore:       cvssScore,
				CVSSSeverity:    cvssSeverity,
				CVSSDescription: cvss.GenerateDescription(cvssVector, assessment.CVSSVersions[version], "en"),
			},
			References: []string{randUrl(), randUrl()},
			GenericDescription: mongo.VulnerabilityGeneric{
				Text: randName(20),
			},
			GenericRemediation: mongo.VulnerabilityGeneric{
				Text: randName(20),
			},
			Description: randName(20),
			Remediation: randName(10),
			Target:      mongo.VulnerabilityTarget(assessment.Targets[rand.Intn(len(assessment.Targets))]),
		}

		vulnerabilities = append(vulnerabilities, vulnerability)

		for j := 0; j < 3; j++ {
			poc := mongo.Poc{
				Index:           j + 1,
				Type:            "request",
				Description:     randName(10),
				URI:             fmt.Sprintf("https://%s", vulnerability.Target.FQDN),
				Request:         randName(20),
				Response:        randName(20),
				VulnerabilityID: vulnerability.ID,
			}

			pocs = append(pocs, poc)
		}
		pocs = append(pocs, mongo.Poc{
			Index:           4,
			Type:            "image",
			Description:     randName(10),
			URI:             fmt.Sprintf("https://%s", vulnerability.Target.FQDN),
			ImageData:       imageDataDecoded,
			ImageCaption:    "Caption" + randName(2),
			VulnerabilityID: vulnerability.ID,
		})

		pocs = append(pocs, mongo.Poc{
			Index:           5,
			Type:            "text",
			Description:     randName(10),
			URI:             fmt.Sprintf("https://%s", vulnerability.Target.FQDN),
			TextLanguage:    "JavaScript",
			TextData:        randName(20),
			VulnerabilityID: vulnerability.ID,
		})
	}

	assessment.VulnerabilityCount = len(vulnerabilities)

	t.Run("test", func(t *testing.T) {
		_, err := GenerateReport(customer, assessment, vulnerabilities, pocs)
		if err != nil {
			t.Errorf("GenerateReport() = %v, want %v, cvss versions %v", err, true, assessment.CVSSVersions)
		}
	})
}
