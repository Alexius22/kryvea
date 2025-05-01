package util

import (
	"unicode"

	"github.com/Alexius22/kryvea/internal/mongo"
	"go.mongodb.org/mongo-driver/v2/bson"
)

const (
	hasUpper   = 1 << 0
	hasLower   = 1 << 1
	hasDigit   = 1 << 2
	hasSpecial = 1 << 3
	allSet     = hasUpper | hasLower | hasDigit | hasSpecial
)

func IsValidPassword(password string) bool {
	if len(password) < 10 {
		return false
	}

	var flags uint8 = 0

	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			flags |= hasUpper
		case unicode.IsLower(char):
			flags |= hasLower
		case unicode.IsDigit(char):
			flags |= hasDigit
		case unicode.IsPunct(char) || unicode.IsSymbol(char) || unicode.IsSpace(char):
			flags |= hasSpecial
		}

		if flags == allSet {
			return true
		}
	}

	return false
}

func CanAccessCustomer(user *mongo.User, customer bson.ObjectID) bool {
	if user.Role == mongo.ROLE_ADMIN {
		return true
	}

	for _, allowedCustomer := range user.Customers {
		if allowedCustomer.ID == customer {
			return true
		}
	}
	return false
}

func IsValidRole(role string) bool {
	for _, r := range mongo.ROLES {
		if r == role {
			return true
		}
	}
	return false
}
