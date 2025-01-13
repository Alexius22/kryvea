package db

import (
	"errors"
)

type Customer struct {
	Model
	Name               string `json:"name" gorm:"uniqueIndex:idx_customer"`
	Lang               string `json:"lang"`
	DefaultCVSSVersion int    `json:"default_cvss_version"`
}

func AddCustomer(customer Customer) error {
	result := Database.Create(&customer)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("Customer already exists")
	}
	return nil
}

func GetAllCustomers() ([]Customer, error) {
	var customers []Customer
	result := Database.Find(&customers)
	if result.Error != nil {
		return customers, result.Error
	}
	return customers, nil
}

func GetCustomerByID(id string) (Customer, error) {
	if id == "" {
		return Customer{}, errors.New("ID is required")
	}

	var customer Customer
	result := Database.First(&customer, Model{ID: id})
	if result.Error != nil {
		return customer, result.Error
	}
	if result.RowsAffected == 0 {
		return customer, errors.New("Customer not found")
	}
	return customer, nil
}

func GetCustomersByName(name string) ([]Customer, error) {
	if name == "" {
		return nil, errors.New("Name is required")
	}

	var customers []Customer
	result := Database.Find(&customers, "name ILIKE ?", "%"+sanitizeLikeQuery(name)+"%")
	if result.Error != nil {
		return customers, result.Error
	}
	if result.RowsAffected == 0 {
		return customers, errors.New("Customer not found")
	}
	return customers, nil
}
