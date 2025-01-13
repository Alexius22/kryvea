package db

import (
	"errors"
	"time"
)

type Assessment struct {
	Model
	Name          string    `json:"name"`
	Notes         string    `json:"notes"`
	StartDateTime time.Time `json:"start_date_time"`
	EndDateTime   time.Time `json:"end_date_time"`
	Targets       []Target  `json:"targets" gorm:"many2many:assessment_targets;"`
	Status        string    `json:"status"`
	Type          string    `json:"type"`
	CVSSVersion   int       `json:"cvss_version"`
	Environment   string    `json:"environment"`
	Network       string    `json:"network"`
	Method        string    `json:"method"`
	OSSTMMVector  string    `json:"osstmm_vector"`
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
	result := Database.Model(&Assessment{}).Preload("Targets").Find(&assessments)
	if result.Error != nil {
		return assessments, result.Error
	}
	return assessments, nil
}

func GetAllAssessmentsByCustomerID(customerID string) ([]Assessment, error) {
	if customerID == "" {
		return nil, errors.New("Customer ID is required")
	}

	var assessments []Assessment
	result := Database.Model(&Assessment{}).Preload("Targets").Find(&assessments, Assessment{CustomerID: customerID})
	if result.Error != nil {
		return assessments, result.Error
	}
	return assessments, nil
}

func GetAssessmentByID(id string) (Assessment, error) {
	if id == "" {
		return Assessment{}, errors.New("ID is required")
	}

	var assessment Assessment
	result := Database.Model(&Assessment{}).Preload("Targets").First(&assessment, Model{ID: id})
	if result.Error != nil {
		return assessment, result.Error
	}
	if result.RowsAffected == 0 {
		return assessment, errors.New("Assessment not found")
	}
	return assessment, nil
}

func GetAssessmentsByName(name string) ([]Assessment, error) {
	if name == "" {
		return nil, errors.New("Name is required")
	}

	var assessments []Assessment
	result := Database.Model(&Assessment{}).Preload("Targets").Find(&assessments, "name ILIKE ?", "%"+sanitizeLikeQuery(name)+"%")
	if result.Error != nil {
		return assessments, result.Error
	}
	return assessments, nil
}
