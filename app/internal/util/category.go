package util

import "github.com/Alexius22/kryvea/internal/mongo"

func IsValidSource(source string) bool {
	switch source {
	case mongo.SOURCE_GENERIC, mongo.SOURCE_NESSUS, mongo.SOURCE_BURP:
		return true
	default:
		return false
	}
}
