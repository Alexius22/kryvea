package db

import "errors"

type Target struct {
	Model
	IP         string   `json:"ip"`
	Port       int      `json:"port"`
	Protocol   string   `json:"protocol"`
	Hostname   string   `json:"hostname"`
	CustomerID string   `json:"customer_id"`
	Customer   Customer `json:"-"`
}

func AddTarget(target Target) error {
	var customer Customer
	result := Database.First(&customer, Model{ID: target.CustomerID})
	if result.Error != nil {
		return result.Error
	}

	result = Database.FirstOrCreate(&target, Target{IP: target.IP, Port: target.Port, Protocol: target.Protocol, Hostname: target.Hostname, CustomerID: target.CustomerID})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("Failed to create target")
	}
	return nil
}

func AddTargetToAssessment(targetID, assessmentID string) error {
	var target Target
	result := Database.First(&target, Model{ID: targetID})
	if result.Error != nil {
		return result.Error
	}

	var assessment Assessment
	result = Database.First(&assessment, Model{ID: assessmentID})
	if result.Error != nil {
		return result.Error
	}

	assessment.Targets = append(assessment.Targets, target)
	result = Database.Save(&assessment)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func GetAllTargets() ([]Target, error) {
	var targets []Target
	result := Database.Find(&targets)
	if result.Error != nil {
		return targets, result.Error
	}
	return targets, nil
}

func GetAllTargetsByCustomerID(customerID string) ([]Target, error) {
	var targets []Target
	result := Database.Find(&targets, Target{CustomerID: customerID})
	if result.Error != nil {
		return targets, result.Error
	}
	return targets, nil
}

func GetTargetByID(id string) (Target, error) {
	var target Target
	result := Database.First(&target, Model{ID: id})
	if result.Error != nil {
		return target, result.Error
	}
	if result.RowsAffected == 0 {
		return target, errors.New("Target not found")
	}
	return target, nil
}

func GetAllTargetsByIP(ip string) ([]Target, error) {
	var targets []Target
	result := Database.Find(&targets, "ip LIKE ?", "%"+sanitizeLikeQuery(ip)+"%")
	if result.Error != nil {
		return targets, result.Error
	}
	return targets, nil
}

func GetAllTargetsByPort(port int) ([]Target, error) {
	var targets []Target
	result := Database.Find(&targets, Target{Port: port})
	if result.Error != nil {
		return targets, result.Error
	}
	return targets, nil
}

func GetAllTargetsByProtocol(protocol string) ([]Target, error) {
	var targets []Target
	result := Database.Find(&targets, Target{Protocol: protocol})
	if result.Error != nil {
		return targets, result.Error
	}
	return targets, nil
}

func GetAllTargetsByHostname(hostname string) ([]Target, error) {
	var targets []Target
	result := Database.Find(&targets, "hostname ILIKE ?", "%"+sanitizeLikeQuery(hostname)+"%")
	if result.Error != nil {
		return targets, result.Error
	}
	return targets, nil
}
