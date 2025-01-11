package db

import "gorm.io/gorm"

type Customer struct {
	gorm.Model
	ID   string `json:"id" gorm:"primary_key"`
	Name string `json:"name" gorm:"primary_key"`
	Lang string `json:"lang" gorm:"primary_key"`
}

func AddCustomer(customer Customer) error {
	return Database.Create(&customer).Error
}
