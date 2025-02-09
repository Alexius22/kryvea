package util

import (
	"github.com/Alexius22/kryvea/internal/mongo"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CanAccessCustomer(user *mongo.User, customer primitive.ObjectID) bool {
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
