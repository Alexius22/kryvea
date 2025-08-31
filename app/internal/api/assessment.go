package api

import (
	"bytes"
	"errors"
	"fmt"
	"time"

	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/report"
	"github.com/Alexius22/kryvea/internal/report/docx"
	"github.com/Alexius22/kryvea/internal/report/xlsx"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type assessmentRequestData struct {
	Name           string    `json:"name"`
	StartDateTime  time.Time `json:"start_date_time"`
	EndDateTime    time.Time `json:"end_date_time"`
	Status         string    `json:"status"`
	Targets        []string  `json:"targets"`
	AssessmentType string    `json:"assessment_type"`
	CVSSVersions   []string  `json:"cvss_versions"`
	Environment    string    `json:"environment"`
	TestingType    string    `json:"testing_type"`
	OSSTMMVector   string    `json:"osstmm_vector"`
	CustomerID     string    `json:"customer_id"`
}

func (d *Driver) AddAssessment(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse request body
	data := &assessmentRequestData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// check if user has access to customer
	customer, errStr := d.customerFromParam(data.CustomerID)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	if !util.CanAccessCustomer(user, customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// validate data
	errStr = d.validateAssessmentData(data)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// parse targets
	targets := []mongo.Target{}
	for _, target := range data.Targets {
		targetID, err := util.ParseUUID(target)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Invalid target ID",
			})
		}
		targets = append(targets, mongo.Target{
			Model: mongo.Model{
				ID: targetID,
			},
		})
	}

	versions := make(map[string]bool)
	for _, version := range data.CVSSVersions {
		versions[version] = true
	}

	// insert assessment into database
	assessmentID, err := d.mongo.Assessment().Insert(&mongo.Assessment{
		Name:           data.Name,
		StartDateTime:  data.StartDateTime,
		EndDateTime:    data.EndDateTime,
		Targets:        targets,
		Status:         data.Status,
		AssessmentType: data.AssessmentType,
		CVSSVersions:   versions,
		Environment:    data.Environment,
		TestingType:    data.TestingType,
		OSSTMMVector:   data.OSSTMMVector,
	}, customer.ID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot create assessment",
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message":       "Assessment created",
		"assessment_id": assessmentID,
	})
}

func (d *Driver) SearchAssessments(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse query parameters
	customerParam := c.Query("customer")
	nameParam := c.Query("name")

	var customerID uuid.UUID
	if customerParam != "" {
		// check if user can access the customer
		customer, errStr := d.customerFromParam(customerParam)
		if errStr != "" {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": errStr,
			})
		}

		if !util.CanAccessCustomer(user, customer.ID) {
			c.Status(fiber.StatusUnauthorized)
			return c.JSON(fiber.Map{
				"error": "Unauthorized",
			})
		}

		customerID = customer.ID
	}

	// retrieve user's customers
	customers := []uuid.UUID{}
	for _, uc := range user.Customers {
		customers = append(customers, uc.ID)
	}
	if user.Role == mongo.RoleAdmin {
		customers = nil
	}

	// retrieve assessments
	assessments, err := d.mongo.Assessment().Search(customers, customerID, nameParam)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot search assessments",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(assessments)
}

func (d *Driver) GetAssessmentsByCustomer(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// check if user can access the customer
	customer, errStr := d.customerFromParam(c.Params("customer"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	if !util.CanAccessCustomer(user, customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// retrieve assessments
	assessments, err := d.mongo.Assessment().GetByCustomerID(customer.ID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot retrieve assessments",
		})
	}

	// set owned assessments
	owned := make(map[uuid.UUID]struct{}, len(user.Assessments))
	for _, ua := range user.Assessments {
		owned[ua.ID] = struct{}{}
	}
	for i := range assessments {
		if _, ok := owned[assessments[i].ID]; ok {
			assessments[i].IsOwned = true
		}
	}

	c.Status(fiber.StatusOK)
	return c.JSON(assessments)
}

func (d *Driver) GetAssessment(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)
	// parse assessment param
	assessmentParam := c.Params("assessment")
	if assessmentParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Assessment ID is required",
		})
	}

	assessmentID, err := util.ParseUUID(assessmentParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid assessment ID",
		})
	}

	assessment, err := d.mongo.Assessment().GetByIDPipeline(assessmentID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid assessment ID",
		})
	}

	// check if user has access to customer
	if !util.CanAccessCustomer(user, assessment.Customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// set owned assessment
	for _, userAssessment := range user.Assessments {
		if userAssessment.ID == assessment.ID {
			assessment.IsOwned = true
			break
		}
	}

	c.Status(fiber.StatusOK)
	return c.JSON(assessment)
}

func (d *Driver) GetOwnedAssessments(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	if len(user.Assessments) == 0 {
		c.Status(fiber.StatusOK)
		return c.JSON([]mongo.Assessment{})
	}

	// map user assessments IDs
	userAssessments := make([]uuid.UUID, len(user.Assessments))
	for i, userAssessment := range user.Assessments {
		userAssessments[i] = userAssessment.ID
	}

	// get assessments from database
	assessments, err := d.mongo.Assessment().GetMultipleByID(userAssessments)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get owned assessments",
		})
	}

	// set owned assessments
	owned := make(map[uuid.UUID]struct{}, len(user.Assessments))
	for _, ua := range user.Assessments {
		owned[ua.ID] = struct{}{}
	}
	for i := range assessments {
		if _, ok := owned[assessments[i].ID]; ok {
			assessments[i].IsOwned = true
		}
	}

	c.Status(fiber.StatusOK)
	return c.JSON(assessments)
}

func (d *Driver) UpdateAssessment(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse assessment param
	assessment, errStr := d.assessmentFromParam(c.Params("assessment"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// parse request body
	data := &assessmentRequestData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	errStr = d.validateAssessmentUpdateData(data)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// check if user has access to customer
	if !util.CanAccessCustomer(user, assessment.Customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// parse targets
	targets := []mongo.Target{}
	for _, target := range data.Targets {
		targetID, err := util.ParseUUID(target)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Invalid target ID",
			})
		}
		targets = append(targets, mongo.Target{
			Model: mongo.Model{
				ID: targetID,
			},
		})
	}

	versions := make(map[string]bool)
	for _, version := range data.CVSSVersions {
		versions[version] = true
	}

	// update assessment in database
	err := d.mongo.Assessment().Update(assessment.ID, &mongo.Assessment{
		Name:           data.Name,
		StartDateTime:  data.StartDateTime,
		EndDateTime:    data.EndDateTime,
		Targets:        targets,
		Status:         data.Status,
		AssessmentType: data.AssessmentType,
		CVSSVersions:   versions,
		Environment:    data.Environment,
		TestingType:    data.TestingType,
		OSSTMMVector:   data.OSSTMMVector,
	})
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot update assessment",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "Assessment updated",
	})
}

func (d *Driver) DeleteAssessment(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse assessment param
	assessment, errStr := d.assessmentFromParam(c.Params("assessment"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// check if user has access to customer
	if !util.CanAccessCustomer(user, assessment.Customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// delete assessment from database
	err := d.mongo.Assessment().Delete(assessment.ID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot delete assessment",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "Assessment deleted",
	})
}

func (d *Driver) CloneAssessment(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse assessment param
	assessment, errStr := d.assessmentFromParam(c.Params("assessment"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// check if user has access to customer
	if !util.CanAccessCustomer(user, assessment.Customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// parse request body
	type reqData struct {
		Name string `json:"name"`
	}

	data := &reqData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	if data.Name == "" {
		data.Name = assessment.Name + " (Clone)"
	}

	// clone assessment
	cloneAssessmentID, err := d.mongo.Assessment().Clone(assessment.ID, data.Name)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot clone assessment",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message":       "Assessment cloned",
		"assessment_id": cloneAssessmentID,
	})
}

func (d *Driver) ExportAssessment(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse assessment param
	assessmentParam := c.Params("assessment")
	if assessmentParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Assessment ID is required",
		})
	}

	assessmentID, err := util.ParseUUID(assessmentParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid Assessment ID",
		})
	}

	assessment, err := d.mongo.Assessment().GetByIDPipeline(assessmentID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid Assessment ID",
		})
	}

	// check if user has access to customer
	customer, err := d.mongo.Customer().GetByID(assessment.Customer.ID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	if !util.CanAccessCustomer(user, customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// parse request body
	type reqData struct {
		Type         string `json:"type"`
		Template     string `json:"template"`
		DeliveryDate string `json:"delivery_date"`
	}

	data := &reqData{}
	if err := c.BodyParser(data); err != nil {
		d.logger.Info().Msg(err.Error())
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	if data.Type == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Type is required",
		})
	}

	// validate template
	template, errStr := d.templateFromParam(data.Template)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	templateBytes, _, err := d.mongo.FileReference().ReadByID(template.FileID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid template ID",
		})
	}

	// retrieve vulnerabilities
	vulnerabilities, err := d.mongo.Vulnerability().GetByAssessmentIDPocPipeline(assessment.ID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Failed to retrieve vulnerabilities",
		})
	}

	// TODO: think
	// retrieve pocs
	// for _, v := range vulnerabilities {
	// 	for i, item := range poc.Pocs {
	// 		if item.ImageID != uuid.Nil {
	// 			imageData, _, err := d.mongo.FileReference().ReadByID(item.ImageID)
	// 			if err != nil {
	// 				c.Status(fiber.StatusInternalServerError)
	// 				return c.JSON(fiber.Map{
	// 					"error": "Failed to read image data",
	// 				})
	// 			}
	// 			poc.Pocs[i].ImageData = imageData
	// 		}
	// 	}
	// }

	reportData := &report.ReportData{
		Customer:                customer,
		Assessment:              assessment,
		Vulnerabilities:         vulnerabilities,
		DeliveryDate:            data.DeliveryDate,
		MaxCVSS:                 make(map[string]mongo.VulnerabilityCVSS),
		VulnerabilitiesOverwiev: make(map[string]report.VulnerabilityOverview),
	}

	// generate report
	var renderedTemplate []byte
	switch data.Type {
	case "xlsx":
		renderedTemplate, err = xlsx.GenerateReport(reportData, templateBytes)
	case "docx":
		renderedTemplate, err = docx.GenerateReport(reportData, templateBytes)
	// case "custom-classic":
	// 	// TODO: make function return []byte
	// 	_, err = xlsx.GenerateReportClassic(customer, assessment, vulnerabilities, reportPoc)
	default:
		err = errors.New("invalid template type")
	}

	if err != nil {
		d.logger.Error().Msg(err.Error())
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Failed to generate report",
		})
	}

	c.Status(fiber.StatusOK)
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=rendered_template.%s", data.Type))
	return c.SendStream(bytes.NewBuffer(renderedTemplate))
}

func (d *Driver) assessmentFromParam(assessmentParam string) (*mongo.Assessment, string) {
	if assessmentParam == "" {
		return nil, "Assessment ID is required"
	}

	assessmentID, err := util.ParseUUID(assessmentParam)
	if err != nil {
		return nil, "Invalid assessment ID"
	}

	assessment, err := d.mongo.Assessment().GetByID(assessmentID)
	if err != nil {
		return nil, "Invalid assessment ID"
	}

	return assessment, ""
}

func (d *Driver) validateAssessmentData(data *assessmentRequestData) string {
	if data.Name == "" {
		return "Name is required"
	}

	if data.StartDateTime.IsZero() {
		return "Start date is required"
	}

	if data.EndDateTime.IsZero() {
		return "End date is required"
	}

	if len(data.CVSSVersions) == 0 {
		return "At least one CVSS version is required"
	}

	for _, version := range data.CVSSVersions {
		if !cvss.IsValidVersion(version) {
			return "Invalid CVSS version"
		}
	}

	return ""
}

func (d *Driver) validateAssessmentUpdateData(data *assessmentRequestData) string {
	if data.Name == "" &&
		data.StartDateTime.IsZero() &&
		data.EndDateTime.IsZero() &&
		data.Status == "" &&
		len(data.Targets) == 0 &&
		data.AssessmentType == "" {

		return "No data to update"
	}

	for _, version := range data.CVSSVersions {
		if !cvss.IsValidVersion(version) {
			return "Invalid CVSS version"
		}
	}

	return ""
}
