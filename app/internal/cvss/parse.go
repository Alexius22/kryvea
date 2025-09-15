package cvss

import (
	"errors"

	gocvss20 "github.com/pandatix/go-cvss/20"
	gocvss30 "github.com/pandatix/go-cvss/30"
	gocvss31 "github.com/pandatix/go-cvss/31"
	gocvss40 "github.com/pandatix/go-cvss/40"
)

// TODO: return a CVSS struct
// ParseVector parses a CVSS vector string and returns the calculated score
// and severity level based on the specified CVSS version.
func ParseVector(vector string, version string) (float64, string, string, error) {
	score, complexity, err := calculateScore(vector, version)
	if err != nil {
		return 0, "", "", err
	}

	severityThresholds, ok := severityLevels[version]
	if !ok {
		return score, "", "", errors.New("no severity levels found for given CVSS version")
	}

	for _, threshold := range severityThresholds {
		if score >= threshold.Score {
			return score, threshold.Severity, complexity, nil
		}
	}

	return score, "", "", errors.New("no severity levels found for given CVSS version")
}

func calculateScore(vector string, version string) (float64, string, error) {
	switch version {
	case Cvss2:
		cvss, err := gocvss20.ParseVector(vector)
		if err != nil {
			return 0, "", err
		}

		ac, err := cvss.Get("AC")
		if err != nil {
			return 0, "", err
		}

		return cvss.EnvironmentalScore(), getComplexity(ac), nil
	case Cvss3:
		cvss, err := gocvss30.ParseVector(vector)
		if err != nil {
			return 0, "", err
		}

		ac, err := cvss.Get("AC")
		if err != nil {
			return 0, "", err
		}

		return cvss.EnvironmentalScore(), getComplexity(ac), nil
	case Cvss31:
		cvss, err := gocvss31.ParseVector(vector)
		if err != nil {
			return 0, "", err
		}

		ac, err := cvss.Get("AC")
		if err != nil {
			return 0, "", err
		}

		return cvss.EnvironmentalScore(), getComplexity(ac), nil
	case Cvss4:
		cvss, err := gocvss40.ParseVector(vector)
		if err != nil {
			return 0, "", err
		}

		ac, err := cvss.Get("AC")
		if err != nil {
			return 0, "", err
		}

		return cvss.Score(), getComplexity(ac), nil
	default:
		return 0, "", errors.New("invalid CVSS version")
	}
}

var complexities map[string]string = map[string]string{
	"L": "Low",
	"M": "Medium",
	"H": "High",
}

func getComplexity(c string) string {
	if complexity, ok := complexities[c]; ok {
		return complexity
	}

	return "Low"
}
