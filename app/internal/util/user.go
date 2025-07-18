package util

import (
	"crypto/rand"
	"fmt"
	"math/big"
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

	minPasswordLength = 10

	upper   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	lower   = "abcdefghijklmnopqrstuvwxyz"
	digits  = "0123456789"
	special = "!@#$%^&*()-_=+[]{}|;:,.<>?/`~ "

	KryveaSessionCookie = "kryvea"
	KryveaShadowCookie  = "kryvea_shadow"
)

var (
	allChars = upper + lower + digits + special
)

func secureRandomInt(max int) (int, error) {
	if max <= 0 {
		return 0, nil
	}

	nBig, err := rand.Int(rand.Reader, big.NewInt(int64(max)))
	if err != nil {
		return 0, fmt.Errorf("failed to generate secure random number: %w", err)
	}

	return int(nBig.Int64()), nil
}

func GenerateRandomPassword(length int) (string, error) {
	if length < minPasswordLength {
		return "", fmt.Errorf("password length must be at least %d characters", minPasswordLength)
	}

	password := make([]byte, length)

	charSets := []string{upper, lower, digits, special}
	for i, charset := range charSets {
		idx, err := secureRandomInt(len(charset))
		if err != nil {
			return "", fmt.Errorf("failed to select character from charset: %w", err)
		}
		password[i] = charset[idx]
	}

	for i := len(charSets); i < length; i++ {
		idx, err := secureRandomInt(len(allChars))
		if err != nil {
			return "", fmt.Errorf("failed to select random character: %w", err)
		}
		password[i] = allChars[idx]
	}

	for i := len(password) - 1; i > 0; i-- {
		j, err := secureRandomInt(i + 1)
		if err != nil {
			return "", fmt.Errorf("failed to shuffle password: %w", err)
		}
		password[i], password[j] = password[j], password[i]
	}

	return string(password), nil
}

func IsValidPassword(password string) bool {
	if len(password) < minPasswordLength {
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

func SetSessionCookie(c *fiber.Ctx, token uuid.UUID, expires time.Time) {
	c.Cookie(&fiber.Cookie{
		Name:     KryveaSessionCookie,
		Value:    token.String(),
		Secure:   true,
		HTTPOnly: true,
		SameSite: "Strict",
		Expires:  expires,
	})

	c.Cookie(&fiber.Cookie{
		Name:     KryveaShadowCookie,
		Value:    "ok",
		Secure:   true,
		HTTPOnly: false,
		SameSite: "Strict",
		Expires:  expires,
	})
}

func ClearCookies(c *fiber.Ctx) {
	c.ClearCookie(KryveaSessionCookie)

	// standard ClearCookie does not allow frontend
	// to check cookie existence as quickly as
	// the following approach does
	c.Cookie(&fiber.Cookie{
		Name:     KryveaShadowCookie,
		Value:    "",
		Secure:   true,
		HTTPOnly: false,
		SameSite: "Strict",
		Expires:  time.Now().Add(-1 * time.Hour),
	})
}
