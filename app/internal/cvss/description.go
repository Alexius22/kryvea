package cvss

import (
	"fmt"
	"strings"
)

var cvssMap = map[string]map[string]map[string]string{
	"3.1": {
		"it": {
			"AV:N": "Network",
			"AV:A": "Adiacente alla rete",
			"AV:L": "Locale",
			"AV:P": "Fisico",
			"AC:L": "bassa",
			"AC:H": "alta",
			"PR:N": "non autenticato",
			"PR:L": "con privilegi limitati",
			"PR:H": "con privilegi elevati",
			"UI:N": "non richiedono l'interazione dell'utente",
			"UI:R": "richiedono l'interazione dell'utente",
			"S:C":  "portare a un cambio di scope",
			"S:U":  "rimanere confinato nella stessa componente",
			"C:H":  "alto",
			"C:L":  "basso",
			"C:N":  "nessun impatto",
			"I:H":  "alto",
			"I:L":  "basso",
			"I:N":  "nessun impatto",
			"A:H":  "alto",
			"A:L":  "basso",
			"A:N":  "nessun impatto",
		},
		"en": {
			"AV:N": "Network",
			"AV:A": "Adjacent Network",
			"AV:L": "Local",
			"AV:P": "Physical",
			"AC:L": "low",
			"AC:H": "high",
			"PR:N": "unauthenticated",
			"PR:L": "with limited privileges",
			"PR:H": "with high privileges",
			"UI:N": "do not require user interaction",
			"UI:R": "require user interaction",
			"S:C":  "lead to a scope change",
			"S:U":  "remain confined within the same component",
			"C:H":  "high",
			"C:L":  "low",
			"C:N":  "no impact",
			"I:H":  "high",
			"I:L":  "low",
			"I:N":  "no impact",
			"A:H":  "high",
			"A:L":  "low",
			"A:N":  "no impact",
		},
	},
	"4.0": {
		"it": {
			"AV:N": "Network",
			"AV:A": "Adiacente",
			"AV:L": "Locale",
			"AV:P": "Fisico",
			"AC:L": "bassa",
			"AC:H": "alta",
			"AT:N": "senza requisiti aggiuntivi",
			"AT:P": "con requisiti aggiuntivi",
			"PR:N": "non autenticato",
			"PR:L": "con privilegi limitati",
			"PR:H": "con privilegi elevati",
			"UI:N": "non richiedono l'interazione dell'utente",
			"UI:P": "richiedono interazione passiva",
			"UI:A": "richiedono interazione attiva",
			"VC:H": "alto",
			"VC:L": "basso",
			"VC:N": "nessun impatto",
			"VI:H": "alto",
			"VI:L": "basso",
			"VI:N": "nessun impatto",
			"VA:H": "alto",
			"VA:L": "basso",
			"VA:N": "nessun impatto",
			"SC:H": "alto",
			"SC:L": "basso",
			"SC:N": "nessun impatto",
			"SI:H": "alto",
			"SI:L": "basso",
			"SI:N": "nessun impatto",
			"SA:H": "alto",
			"SA:L": "basso",
			"SA:N": "nessun impatto",
		},
		"en": {
			"AV:N": "Network",
			"AV:A": "Adjacent",
			"AV:L": "Local",
			"AV:P": "Physical",
			"AC:L": "low",
			"AC:H": "high",
			"AT:N": "no additional",
			"AT:P": "additional",
			"PR:N": "unauthenticated",
			"PR:L": "with limited privileges",
			"PR:H": "with high privileges",
			"UI:N": "do not require user interaction",
			"UI:P": "require passive interaction",
			"UI:A": "require active interaction",
			"VC:H": "high",
			"VC:L": "low",
			"VC:N": "no impact",
			"VI:H": "high",
			"VI:L": "low",
			"VI:N": "no impact",
			"VA:H": "high",
			"VA:L": "low",
			"VA:N": "no impact",
			"SC:H": "high",
			"SC:L": "low",
			"SC:N": "no impact",
			"SI:H": "high",
			"SI:L": "low",
			"SI:N": "no impact",
			"SA:H": "high",
			"SA:L": "low",
			"SA:N": "no impact",
		},
	},
}

var descriptions = map[string]map[string]string{
	"3.1": {
		"it": "Un attaccante %s, utilizzando un vettore di tipo %s, è potenzialmente in grado di effettuare attacchi di complessità %s con conseguente impatto %s sulla confidenzialità, %s sull'integrità e %s sulla disponibilità. Gli attacchi %s e un attacco ben riuscito può %s.",
		"en": "An attacker %s, using a %s vector, can potentially carry out %s complexity attacks resulting in %s on confidentiality, %s on integrity, and %s on availability. The attacks %s, and a successful attack may %s.",
	},
	"4.0": {
		"it": "Un attaccante %s, utilizzando un vettore di tipo %s, è potenzialmente in grado di effettuare attacchi di complessità %s %s. Gli attacchi %s. L'impatto risultante è %s sulla confidenzialità, %s sull'integrità, %s sulla disponibilità. Impatto successivo: %s sulla confidenzialità, %s sull'integrità e %s sulla disponibilità.",
		"en": "An attacker %s, using a %s vector, can potentially carry out %s complexity attacks with %s requirements. The attacks %s. The resulting impact is %s on confidentiality, %s on integrity, %s on availability. Subsequent impact: %s on confidentiality, %s on integrity, and %s on availability.",
	},
}

func GenerateDescription(vector, version, language string) string {
	vector = vector[len("CVSS:4.0"):]
	fields := strings.Split(vector, "/")
	vector_map := make(map[string]string)

	if _, exists := cvssMap[version][language]; !exists {
		language = "en"
	}

	for _, field := range fields {
		if desc, exists := cvssMap[version][language][field]; exists {
			metric := strings.Split(field, ":")[0]
			vector_map[metric] = desc
		}
	}

	switch version {
	case "3.1":
		return fmt.Sprintf(
			descriptions[version][language],
			vector_map["PR"], vector_map["AV"], vector_map["AC"], vector_map["C"], vector_map["I"], vector_map["A"], vector_map["UI"], vector_map["S"],
		)
	case "4.0":
		return fmt.Sprintf(
			descriptions[version][language],
			vector_map["PR"], vector_map["AV"], vector_map["AC"], vector_map["AT"], vector_map["UI"], vector_map["VC"], vector_map["VI"], vector_map["VA"], vector_map["SC"], vector_map["SI"], vector_map["SA"],
		)
	default:
		return ""
	}
}
