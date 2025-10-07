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

// GetOWASPColor returns the color associated with a specific OWASP category for a given counter.
//
// Parameters:
//   - counter: An OWASPCounter that holds a mapping of categories to colors.
//   - category: The OWASP category string (e.g., "A02:2021").
//
// Returns:
//   - The color string associated with the category. If the category is not present
//     in the counter, it defaults to the color corresponding to CvssSeverityNone.
//
// Usage in templates:
//
//	{{ getOWASPColor (index .OWASPCounter "owasp_web") "A02:2021" }}
func GetOWASPColor(counter OWASPCounter, category string) string {
	if color, ok := counter.Categories[category]; ok {
		return color
	}
	return severityColors[cvss.CvssSeverityNone]
}

// TableSeverityColor returns a formatted string suitable for use in a table cell,
// applying a background color based on the severity level.
//
// Parameters:
//   - severity: A string representing the severity level (e.g., "Low", "High").
//
// Returns:
//   - A string in the format "[[TABLE_CELL_BG_COLOR:<COLOR>]]<SEVERITY>",
//     where <COLOR> is the uppercase color corresponding to the severity.
//
// Usage in templates:
//
//	{{ tableSeverityColor .CVSSv4.Severity }}
func TableSeverityColor(severity string) string {
	color := getSeverityColor(severity)
	return fmt.Sprintf("[[TABLE_CELL_BG_COLOR:%s]]", strings.ToUpper(color))
}

// TableComplexityColor returns a formatted string suitable for use in a table cell,
// applying a background color based on the complexity level. Only the background color
// is included; the cell text is omitted.
//
// Parameters:
//   - complexity: A string representing the complexity level (e.g., "Low", "High").
//
// Returns:
//   - A string in the format "[[TABLE_CELL_BG_COLOR:<COLOR>]]",
//     where <COLOR> is the uppercase color corresponding to the complexity.
//
// Usage in templates:
//
//	{{ tableComplexityColor .CVSSv4.Complexity }}
func TableComplexityColor(complexity string) string {
	color := getComplexityColor(complexity)
	return fmt.Sprintf("[[TABLE_CELL_BG_COLOR:%s]]", strings.ToUpper(color))
}
