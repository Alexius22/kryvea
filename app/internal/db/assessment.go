package db

import (
	"errors"
	"time"
)

type Assessment struct {
	Model
	Name          string    `json:"name"`
	StartDateTime time.Time `json:"start_date_time"`
	EndDateTime   time.Time `json:"end_date_time"`
	Type          string    `json:"type"`
	Status        string    `json:"status"`
	CVSSVersion   int       `json:"cvss_version"`
	CustomerID    string    `json:"customer_id"`
	Customer      Customer  `json:"-"`
}

func AddAssessment(assessment Assessment) error {
	var customer Customer
	result := Database.First(&customer, Model{ID: assessment.CustomerID})
	if result.Error != nil {
		return result.Error
	}

	result = Database.Create(&assessment)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("Failed to create assessment")
	}
	return nil
}

func GetAllAssessments() ([]Assessment, error) {
	var assessments []Assessment
	result := Database.Find(&assessments)
	if result.Error != nil {
		return assessments, result.Error
	}
	return assessments, nil
}

func GetAllAssessmentsByCustomerID(customerID string) ([]Assessment, error) {
	var assessments []Assessment
	result := Database.Find(&assessments, Assessment{CustomerID: customerID})
	if result.Error != nil {
		return assessments, result.Error
	}
	return assessments, nil
}

func GetAssessmentByID(id string) (Assessment, error) {
	var assessment Assessment
	result := Database.First(&assessment, Model{ID: id})
	if result.Error != nil {
		return assessment, result.Error
	}
	if result.RowsAffected == 0 {
		return assessment, errors.New("Assessment not found")
	}
	return assessment, nil
}

func GetAssessmentByName(name string) (Assessment, error) {
	var assessment Assessment
	result := Database.First(&assessment, Assessment{Name: name})
	if result.Error != nil {
		return assessment, result.Error
	}
	if result.RowsAffected == 0 {
		return assessment, errors.New("Assessment not found")
	}
	return assessment, nil
}
