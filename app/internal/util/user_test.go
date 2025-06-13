package util

import (
	"testing"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/google/uuid"
)

func TestCanAccessCustomer(t *testing.T) {
	adminUser := &mongo.User{
		Role: mongo.ROLE_ADMIN,
	}
	regularUser := &mongo.User{
		Role: mongo.ROLE_USER,
		Customers: []mongo.UserCustomer{
			{ID: uuid.New()},
			{ID: uuid.New()},
		},
	}
	existingCustomer := regularUser.Customers[0].ID
	nonExistingCustomer := uuid.New()

	tests := []struct {
		name     string
		user     *mongo.User
		customer uuid.UUID
		want     bool
	}{
		{"Admin user", adminUser, uuid.New(), true},
		{"Regular user with access", regularUser, existingCustomer, true},
		{"Regular user without access", regularUser, nonExistingCustomer, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := CanAccessCustomer(tt.user, tt.customer); got != tt.want {
				t.Errorf("CanAccessCustomer() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestIsValidRole(t *testing.T) {
	tests := []struct {
		name string
		role string
		want bool
	}{
		{"Valid role", mongo.ROLE_ADMIN, true},
		{"Invalid role", "invalid_role", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := IsValidRole(tt.role); got != tt.want {
				t.Errorf("IsValidRole() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestIsValidPassword(t *testing.T) {
	tests := []struct {
		name     string
		password string
		want     bool
	}{
		{"Valid password", "Password1@", true},
		{"No uppercase letter", "password1@", false},
		{"No lowercase letter", "PASSWORD1@", false},
		{"No digit", "Password@", false},
		{"No special character", "Password1", false},
		{"Too short", "P1@", false},
		{"Empty password", "", false},
		{"With space", "Password 1", true},
		{"With punctuation", "Password.1", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := IsValidPassword(tt.password); got != tt.want {
				t.Errorf("IsValidPassword() = %v, want %v", got, tt.want)
			}
		})
	}
}
