package util

import "github.com/Alexius22/kryvea/internal/mongo"

func IsValidSource(source string) bool {
	switch source {
	case mongo.SourceGeneric, mongo.SourceNessus, mongo.SourceBurp:
		return true
	default:
		return false
	}
}
