package util

import "go.mongodb.org/mongo-driver/bson/primitive"

func CanAccessCustomer(allowedCustomers []primitive.ObjectID, customer primitive.ObjectID) bool {
	for _, allowedCustomer := range allowedCustomers {
		if allowedCustomer == customer {
			return true
		}
	}
	return false
}
