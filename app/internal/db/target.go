package db

// import (
// 	"errors"
// )

// type Target struct {
// 	Model
// 	IP         string   `json:"ip" gorm:"uniqueIndex:idx_target"`
// 	Port       int      `json:"port" gorm:"uniqueIndex:idx_target"`
// 	Protocol   string   `json:"protocol" gorm:"uniqueIndex:idx_target"`
// 	Hostname   string   `json:"hostname" gorm:"uniqueIndex:idx_target"`
// 	CustomerID string   `json:"customer_id" gorm:"uniqueIndex:idx_target"`
// 	Customer   Customer `json:"-"`
// }

// func AddTarget(target Target) error {
// 	result := Database.First(&Customer{}, Model{ID: target.CustomerID})
// 	if result.Error != nil {
// 		return result.Error
// 	}

// 	result = Database.Create(&target)
// 	if result.Error != nil {
// 		return result.Error
// 	}
// 	if result.RowsAffected == 0 {
// 		return errors.New("Failed to create target")
// 	}
// 	return nil
// }

// func AddTargetToAssessment(targetID, assessmentID string) error {
// 	if targetID == "" || assessmentID == "" {
// 		return errors.New("Target ID and Assessment ID are required")
// 	}

// 	var target Target
// 	result := Database.First(&target, Model{ID: targetID})
// 	if result.Error != nil {
// 		return result.Error
// 	}

// 	var assessment Assessment
// 	result = Database.First(&assessment, Model{ID: assessmentID})
// 	if result.Error != nil {
// 		return result.Error
// 	}

// 	assessment.Targets = append(assessment.Targets, target)
// 	result = Database.Save(&assessment)
// 	if result.Error != nil {
// 		return result.Error
// 	}
// 	return nil
// }

// func GetAllTargets() ([]Target, error) {
// 	var targets []Target
// 	result := Database.Find(&targets)
// 	if result.Error != nil {
// 		return targets, result.Error
// 	}
// 	return targets, nil
// }

// func GetAllTargetsByCustomerID(customerID string) ([]Target, error) {
// 	if customerID == "" {
// 		return nil, errors.New("Customer ID is required")
// 	}

// 	var targets []Target
// 	result := Database.Find(&targets, Target{CustomerID: customerID})
// 	if result.Error != nil {
// 		return targets, result.Error
// 	}
// 	return targets, nil
// }

// func GetTargetByID(id string) (Target, error) {
// 	if id == "" {
// 		return Target{}, errors.New("ID is required")
// 	}

// 	var target Target
// 	result := Database.First(&target, Model{ID: id})
// 	if result.Error != nil {
// 		return target, result.Error
// 	}
// 	if result.RowsAffected == 0 {
// 		return target, errors.New("Target not found")
// 	}
// 	return target, nil
// }

// func GetAllTargetsByIP(ip string) ([]Target, error) {
// 	if ip == "" {
// 		return nil, errors.New("IP is required")
// 	}

// 	var targets []Target
// 	result := Database.Find(&targets, "ip LIKE ?", "%"+sanitizeLikeQuery(ip)+"%")
// 	if result.Error != nil {
// 		return targets, result.Error
// 	}
// 	return targets, nil
// }

// func GetAllTargetsByPort(port int) ([]Target, error) {
// 	var targets []Target
// 	result := Database.Find(&targets, Target{Port: port})
// 	if result.Error != nil {
// 		return targets, result.Error
// 	}
// 	return targets, nil
// }

// func GetAllTargetsByProtocol(protocol string) ([]Target, error) {
// 	if protocol == "" {
// 		return nil, errors.New("Protocol is required")
// 	}

// 	var targets []Target
// 	result := Database.Find(&targets, Target{Protocol: protocol})
// 	if result.Error != nil {
// 		return targets, result.Error
// 	}
// 	return targets, nil
// }

// func GetAllTargetsByHostname(hostname string) ([]Target, error) {
// 	if hostname == "" {
// 		return nil, errors.New("Hostname is required")
// 	}

// 	var targets []Target
// 	result := Database.Find(&targets, "hostname ILIKE ?", "%"+sanitizeLikeQuery(hostname)+"%")
// 	if result.Error != nil {
// 		return targets, result.Error
// 	}
// 	return targets, nil
// }

// func SearchTarget(search string) ([]Target, error) {
// 	if search == "" {
// 		return nil, errors.New("Search is required")
// 	}

// 	var targets []Target
// 	result := Database.Find(&targets, "ip ILIKE ? OR CAST(port as TEXT) ILIKE ? OR protocol ILIKE ? OR hostname ILIKE ?", "%"+sanitizeLikeQuery(search)+"%", "%"+sanitizeLikeQuery(search)+"%", "%"+sanitizeLikeQuery(search)+"%", "%"+sanitizeLikeQuery(search)+"%")
// 	if result.Error != nil {
// 		return targets, result.Error
// 	}
// 	return targets, nil
// }
