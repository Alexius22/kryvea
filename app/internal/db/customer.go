package db

import (
	"errors"
)

type Customer struct {
	Model
	Name               string `json:"name"`
	Lang               string `json:"lang"`
	DefaultCVSSVersion int    `json:"default_cvss_version"`
}

func AddCustomer(customer Customer) error {
	result := Database.FirstOrCreate(&customer, Customer{Name: customer.Name})
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

func GetCustomerByName(name string) (Customer, error) {
	var customer Customer
	result := Database.First(&customer, Customer{Name: name})
	if result.Error != nil {
		return customer, result.Error
	}
	if result.RowsAffected == 0 {
		return customer, errors.New("Customer not found")
	}
	return customer, nil
}
