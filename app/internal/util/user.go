package util

import (
	"time"
	"unicode"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
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

func CanAccessCustomer(user *mongo.User, customer uuid.UUID) bool {
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
	if role == "" {
		return false
	}

	for _, r := range mongo.ROLES {
		if r == role {
			return true
		}
	}

	return false
}

// ClearShadowCookie removes the cookie visible to the client,
// meaning new login is required.
func ClearShadowCookie(c *fiber.Ctx) {
	c.Cookie(&fiber.Cookie{
		Name:     "kryvea_shadow",
		Value:    "",
		Secure:   true,
		HTTPOnly: false,
		SameSite: "Strict",
		Expires:  time.Now().Add(-1 * time.Hour),
	})
}
