package util

import (
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/google/uuid"
)

func IsNullCustomer(customer *mongo.Customer) bool {
	if customer == nil {
		return true
	}

	if customer.ID == uuid.Nil {
		return true
	}

	return false
}
