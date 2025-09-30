package templates

import (
    "bufio"
    "fmt"
    "os"
    "strings"
    "sync"
    "text/template"
    "time"

    "github.com/Alexius22/kryvea/internal/poc"
    reportdata "github.com/Alexius22/kryvea/internal/report/data"
    gotemplatedocx "github.com/JJJJJJack/go-template-docx"
)

type DocxTemplate struct {
	TemplateBytes []byte
	filename      string
	extension     string
}

func NewDocxTemplate(templateBytes []byte) (*DocxTemplate, error) {
	if templateBytes == nil {
		return nil, ErrTemplateByteRequired
	}

	return &DocxTemplate{
		TemplateBytes: templateBytes,
		extension:     "docx",
	}, nil
}

func (t *DocxTemplate) Render(reportData *reportdata.ReportData) ([]byte, error) {
	t.filename = fmt.Sprintf("%s - %s - %s", reportData.Assessment.Type.Short, reportData.Customer.Name, reportData.Assessment.Name)

	reportData.Prepare()

	DocxTemplate, err := gotemplatedocx.NewDocxTemplateFromBytes(t.TemplateBytes)
	if err != nil {
		return nil, err
	}

	addedImages := make(map[string]bool)
	for _, vulnerability := range reportData.Vulnerabilities {
		for _, pocItem := range vulnerability.Poc.Pocs {
			if pocItem.Type == poc.PocTypeImage {
				if _, ok := addedImages[pocItem.ImageFilename]; !ok {
					fmt.Println("adding image:", pocItem.ImageFilename)
					DocxTemplate.Media(pocItem.ImageFilename, pocItem.ImageData)
					addedImages[pocItem.ImageFilename] = true
				}
			}
		}
	}

	DocxTemplate.AddTemplateFuncs(template.FuncMap{
		"formatDate": formatDate,
		"debug":      debug,
	})

	err = DocxTemplate.Apply(reportData)
	if err != nil {
		return nil, err
	}

	return DocxTemplate.Bytes(), nil
}

func (t *DocxTemplate) Filename() string {
	return fmt.Sprintf("%s.%s", t.filename, t.extension)
}

func (t *DocxTemplate) Extension() string {
    return t.extension
}

// Lazy index of IANA timezone -> ISO country code using tzdata's zone1970.tab.
var (
    zoneCountryOnce sync.Once
    zoneToCountry   map[string]string
)

func buildZoneCountryIndex() {
    zoneToCountry = map[string]string{}
    f, err := os.Open("/usr/share/zoneinfo/zone1970.tab")
    if err != nil {
        return // best-effort; fallback layouts will apply
    }
    defer f.Close()

    scanner := bufio.NewScanner(f)
    for scanner.Scan() {
        line := scanner.Text()
        if line == "" || strings.HasPrefix(line, "#") {
            continue
        }
        // Format: cc[","cc...] TAB coordinates TAB TZ TAB comments
        parts := strings.Split(line, "\t")
        if len(parts) < 3 {
            continue
        }
        ccField := parts[0]
        tzField := parts[2]
        tz := strings.TrimSpace(tzField)
        if tz == "" {
            continue
        }
        // Take the first country code if multiple are present.
        cc := strings.TrimSpace(strings.Split(ccField, ",")[0])
        if cc == "" {
            continue
        }
        if _, exists := zoneToCountry[tz]; !exists {
            zoneToCountry[tz] = strings.ToUpper(cc)
        }
    }
}

func countryForZone(zone string) (string, bool) {
    zoneCountryOnce.Do(buildZoneCountryIndex)
    cc, ok := zoneToCountry[zone]
    return cc, ok
}

func layoutForCountry(cc string) string {
    switch strings.ToUpper(cc) {
    case "US":
        return "01/02/2006" // MM/DD/YYYY
    case "JP", "CN", "KR":
        return "2006/01/02" // YYYY/MM/DD
    default:
        return "02/01/2006" // DD/MM/YYYY
    }
}

// formatDate formats the given time using a locale-aware layout inferred from timezone.
// Signature: formatDate(t, tz?, style?)
//   - tz: optional IANA timezone (e.g., "Europe/Rome"). If missing/invalid, UTC is used.
//   - style: optional override (case-insensitive): "US" (MM/DD/YYYY), "EU" (DD/MM/YYYY), "ISO" (2006-01-02),
//            "YMD" (2006/01/02), "DMY" (02/01/2006), "MDY" (01/02/2006).
// Notes:
//   - Only the date part is returned; no time-of-day is printed.
func formatDate(t time.Time, args ...string) string {
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

func debug(v any) string {
	return fmt.Sprintf("%#v", v)
}
