package cvss

import (
	"fmt"
	"strings"

	"golang.org/x/text/language"
)

// To handle multiple languages, we could use go-i18n
// or even better, insert all the GenerateDesciption logic
// inside the docx template
const (
	// CVSS 3.1
	AV_N = "AV:N"
	AV_A = "AV:A"
	AV_L = "AV:L"
	AV_P = "AV:P"
	AC_L = "AC:L"
	AC_H = "AC:H"
	PR_N = "PR:N"
	PR_L = "PR:L"
	PR_H = "PR:H"
	UI_N = "UI:N"
	UI_R = "UI:R"
	S_C  = "S:C"
	S_U  = "S:U"
	C_H  = "C:H"
	C_L  = "C:L"
	C_N  = "C:N"
	I_H  = "I:H"
	I_L  = "I:L"
	I_N  = "I:N"
	A_H  = "A:H"
	A_L  = "A:L"
	A_N  = "A:N"

	PR = "PR"
	AV = "AV"
	AC = "AC"
	C  = "C"
	I  = "I"
	A  = "A"
	UI = "UI"
	S  = "S"

	// CVSS 4.0
	// AV_N = "AV:N"
	// AV_A = "AV:A"
	// AV_L = "AV:L"
	// AV_P = "AV:P"
	// AC_L = "AC:L"
	// AC_H = "AC:H"
	AT_N = "AT:N"
	AT_P = "AT:P"
	// PR_N = "PR:N"
	// PR_L = "PR:L"
	// PR_H = "PR:H"
	// UI_N = "UI:N"
	UI_P = "UI:P"
	UI_A = "UI:A"
	VC_H = "VC:H"
	VC_L = "VC:L"
	VC_N = "VC:N"
	VI_H = "VI:H"
	VI_L = "VI:L"
	VI_N = "VI:N"
	VA_H = "VA:H"
	VA_L = "VA:L"
	VA_N = "VA:N"
	SC_H = "SC:H"
	SC_L = "SC:L"
	SC_N = "SC:N"
	SI_H = "SI:H"
	SI_L = "SI:L"
	SI_N = "SI:N"
	SA_H = "SA:H"
	SA_L = "SA:L"
	SA_N = "SA:N"

	// PR = "PR"
	// AV = "AV"
	// AC = "AC"
	AT = "AT"
	// UI = "UI"
	VC = "VC"
	VI = "VI"
	VA = "VA"
	SC = "SC"
	SI = "SI"
	SA = "SA"
)

var cvssMap = map[string]map[string]map[string]string{
	CVSS31: {
		language.Italian.String(): {
			AV_N: "Network",
			AV_A: "Adiacente alla rete",
			AV_L: "Locale",
			AV_P: "Fisico",
			AC_L: "bassa",
			AC_H: "alta",
			PR_N: "non autenticato",
			PR_L: "con privilegi limitati",
			PR_H: "con privilegi elevati",
			UI_N: "non richiedono l'interazione dell'utente",
			UI_R: "richiedono l'interazione dell'utente",
			S_C:  "portare a un cambio di scope",
			S_U:  "rimanere confinato nella stessa componente",
			C_H:  "alto",
			C_L:  "basso",
			C_N:  "nessun impatto",
			I_H:  "alto",
			I_L:  "basso",
			I_N:  "nessun impatto",
			A_H:  "alto",
			A_L:  "basso",
			A_N:  "nessun impatto",
		},
		language.English.String(): {
			AV_N: "Network",
			AV_A: "Adjacent Network",
			AV_L: "Local",
			AV_P: "Physical",
			AC_L: "low",
			AC_H: "high",
			PR_N: "unauthenticated",
			PR_L: "with limited privileges",
			PR_H: "with high privileges",
			UI_N: "do not require user interaction",
			UI_R: "require user interaction",
			S_C:  "lead to a scope change",
			S_U:  "remain confined within the same component",
			C_H:  "high",
			C_L:  "low",
			C_N:  "no impact",
			I_H:  "high",
			I_L:  "low",
			I_N:  "no impact",
			A_H:  "high",
			A_L:  "low",
			A_N:  "no impact",
		},
	},
	CVSS4: {
		language.Italian.String(): {
			AV_N: "Network",
			AV_A: "Adiacente",
			AV_L: "Locale",
			AV_P: "Fisico",
			AC_L: "bassa",
			AC_H: "alta",
			AT_N: "senza requisiti aggiuntivi",
			AT_P: "con requisiti aggiuntivi",
			PR_N: "non autenticato",
			PR_L: "con privilegi limitati",
			PR_H: "con privilegi elevati",
			UI_N: "non richiedono l'interazione dell'utente",
			UI_P: "richiedono interazione passiva",
			UI_A: "richiedono interazione attiva",
			VC_H: "alto",
			VC_L: "basso",
			VC_N: "nessun impatto",
			VI_H: "alto",
			VI_L: "basso",
			VI_N: "nessun impatto",
			VA_H: "alto",
			VA_L: "basso",
			VA_N: "nessun impatto",
			SC_H: "alto",
			SC_L: "basso",
			SC_N: "nessun impatto",
			SI_H: "alto",
			SI_L: "basso",
			SI_N: "nessun impatto",
			SA_H: "alto",
			SA_L: "basso",
			SA_N: "nessun impatto",
		},
		language.English.String(): {
			AV_N: "Network",
			AV_A: "Adjacent",
			AV_L: "Local",
			AV_P: "Physical",
			AC_L: "low",
			AC_H: "high",
			AT_N: "no additional",
			AT_P: "additional",
			PR_N: "unauthenticated",
			PR_L: "with limited privileges",
			PR_H: "with high privileges",
			UI_N: "do not require user interaction",
			UI_P: "require passive interaction",
			UI_A: "require active interaction",
			VC_H: "high",
			VC_L: "low",
			VC_N: "no impact",
			VI_H: "high",
			VI_L: "low",
			VI_N: "no impact",
			VA_H: "high",
			VA_L: "low",
			VA_N: "no impact",
			SC_H: "high",
			SC_L: "low",
			SC_N: "no impact",
			SI_H: "high",
			SI_L: "low",
			SI_N: "no impact",
			SA_H: "high",
			SA_L: "low",
			SA_N: "no impact",
		},
	},
}

var descriptions = map[string]map[string]string{
	CVSS31: {
		language.Italian.String(): "Un attaccante %s, utilizzando un vettore di tipo %s, è potenzialmente in grado di effettuare attacchi di complessità %s con conseguente impatto %s sulla confidenzialità, %s sull'integrità e %s sulla disponibilità. Gli attacchi %s e un attacco ben riuscito può %s.",
		language.English.String(): "An attacker %s, using a %s vector, can potentially carry out %s complexity attacks resulting in %s on confidentiality, %s on integrity, and %s on availability. The attacks %s, and a successful attack may %s.",
	},
	CVSS4: {
		language.Italian.String(): "Un attaccante %s, utilizzando un vettore di tipo %s, è potenzialmente in grado di effettuare attacchi di complessità %s %s. Gli attacchi %s. L'impatto risultante è %s sulla confidenzialità, %s sull'integrità, %s sulla disponibilità. Impatto successivo: %s sulla confidenzialità, %s sull'integrità e %s sulla disponibilità.",
		language.English.String(): "An attacker %s, using a %s vector, can potentially carry out %s complexity attacks with %s requirements. The attacks %s. The resulting impact is %s on confidentiality, %s on integrity, %s on availability. Subsequent impact: %s on confidentiality, %s on integrity, and %s on availability.",
	},
}

func GenerateDescription(vector, version, lang string) string {
	if version == CVSS3 {
		version = CVSS31
	}

	if _, exists := cvssMap[version][lang]; !exists {
		lang = language.English.String()
	}

	fields := strings.Split(vector, "/")[1:]
	vector_map := make(map[string]string)
	for _, field := range fields {
		if desc, exists := cvssMap[version][lang][field]; exists {
			metric := strings.Split(field, ":")[0]
			vector_map[metric] = desc
		}
	}

	switch version {
	case CVSS31:
		return fmt.Sprintf(
			descriptions[version][lang],
			vector_map[PR], vector_map[AV], vector_map[AC], vector_map[C], vector_map[I], vector_map[A], vector_map[UI], vector_map[S],
		)
	case CVSS4:
		return fmt.Sprintf(
			descriptions[version][lang],
			vector_map[PR], vector_map[AV], vector_map[AC], vector_map[AT], vector_map[UI], vector_map[VC], vector_map[VI], vector_map[VA], vector_map[SC], vector_map[SI], vector_map[SA],
		)
	default:
		return ""
	}
}
