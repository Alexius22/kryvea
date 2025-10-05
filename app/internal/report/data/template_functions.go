package reportdata

import (
	"fmt"
	"strings"
	"time"

	"github.com/Alexius22/kryvea/internal/cvss"
)

func Debug(v any) string {
	return fmt.Sprintf("%#v", v)
}

// formatDate formats the given time using a locale-aware layout inferred from timezone.
// Signature: formatDate(t, tz?, style?)
//   - tz: optional IANA timezone (e.g., "Europe/Rome"). If missing/invalid, UTC is used.
//   - style: optional override (case-insensitive): "US" (MM/DD/YYYY), "EU" (DD/MM/YYYY), "ISO" (2006-01-02),
//     "YMD" (2006/01/02), "DMY" (02/01/2006), "MDY" (01/02/2006).
//
// Notes:
//   - Only the date part is returned; no time-of-day is printed.
func FormatDate(t time.Time, args ...string) string {
	// Location resolution (default UTC)
	loc := time.UTC
	if len(args) > 0 && args[0] != "" {
		if l, err := time.LoadLocation(args[0]); err == nil {
			loc = l
		}
	}

	// Layout selection
	layout := "02/01/2006" // default (DD/MM/YYYY) keeps backward-compat behavior

	// Optional explicit style override
	if len(args) > 1 && args[1] != "" {
		switch strings.ToUpper(strings.TrimSpace(args[1])) {
		case "US", "MDY":
			layout = "01/02/2006"
		case "EU", "DMY":
			layout = "02/01/2006"
		case "ISO", "YYYY-MM-DD", "Y-M-D":
			layout = "2006-01-02"
		case "YMD":
			layout = "2006/01/02"
		}
	} else if len(args) > 0 && args[0] != "" {
		// Infer from timezone -> country
		if cc, ok := countryForZone(args[0]); ok {
			layout = layoutForCountry(cc)
		}
	}

	return t.In(loc).Format(layout)
}

// Usage: {{ getOWASPColor (index .OWASPCounter "owasp_web") "A02:2021" }}
func GetOWASPColor(counter OWASPCounter, category string) string {
	if color, ok := counter.Categories[category]; ok {
		return color
	}
	return severityColors[cvss.CvssSeverityNone]
}

// Usage: within vulnerability range: {{tableSeverityColor .CVSSv4.Severity}}
func TableSeverityColor(severity string) string {
	color := getSeverityColor(severity)
	return fmt.Sprintf("[[TABLE_CELL_BG_COLOR:%s]]%s", strings.ToUpper(color), severity)
}

// Usage: within vulnerability range: {{tableSeverityColor .CVSSv4.Complexity}}
func TableComplexityColor(complexity string) string {
	color := getComplexityColor(complexity)
	return fmt.Sprintf("[[TABLE_CELL_BG_COLOR:%s]]%s", strings.ToUpper(color), complexity)
}
