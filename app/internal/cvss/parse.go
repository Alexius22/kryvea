package cvss

import (
	"errors"

	gocvss20 "github.com/pandatix/go-cvss/20"
	gocvss30 "github.com/pandatix/go-cvss/30"
	gocvss31 "github.com/pandatix/go-cvss/31"
	gocvss40 "github.com/pandatix/go-cvss/40"
)

func ParseVector(vector string, version string) (float64, string, error) {
	score, err := calculateScore(vector, version)
	if err != nil {
		return 0, "", err
	}

	severityThresholds, ok := severityLevels[version] // Use the "ok" idiom
	if !ok {
		return score, "", errors.New("no severity levels found for given CVSS version")
	}

	for _, threshold := range severityThresholds {
		if score >= threshold.Score {
			return score, threshold.Severity, nil
		}
	}

	return score, "", errors.New("no severity levels found for given CVSS version")
}

func calculateScore(vector string, version string) (float64, error) {
	switch version {
	case CVSS2:
		cvss, err := gocvss20.ParseVector(vector)
		if err != nil {
			return 0, err
		}
		return cvss.EnvironmentalScore(), nil
	case CVSS3:
		cvss, err := gocvss30.ParseVector(vector)
		if err != nil {
			return 0, err
		}
		return cvss.EnvironmentalScore(), nil
	case CVSS31:
		cvss, err := gocvss31.ParseVector(vector)
		if err != nil {
			return 0, err
		}
		return cvss.EnvironmentalScore(), nil
	case CVSS4:
		cvss, err := gocvss40.ParseVector(vector)
		if err != nil {
			return 0, err
		}
		return cvss.Score(), nil
	default:
		return 0, errors.New("Invalid CVSS version")
	}
}
