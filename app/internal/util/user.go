package util

import (
	"github.com/Alexius22/kryvea/internal/mongo"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CanAccessCustomer(user *mongo.User, customer primitive.ObjectID) bool {
	if user.IsAdmin {
		return true
	}

	for _, allowedCustomer := range user.Customers {
		if allowedCustomer == customer {
			return true
		}
	}
	return false
}
