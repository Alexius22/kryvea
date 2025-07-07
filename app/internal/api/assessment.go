package api

import (
	"fmt"
	"strconv"
	"time"

	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
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
	errStr = d.validateAssessmentData(data, customer.DefaultCVSSVersions)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// parse targets
	var targets []mongo.Target
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

	// insert assessment into database
	assessmentID, err := d.mongo.Assessment().Insert(&mongo.Assessment{
		Name:           data.Name,
		StartDateTime:  data.StartDateTime,
		EndDateTime:    data.EndDateTime,
		Targets:        targets,
		Status:         data.Status,
		AssessmentType: data.AssessmentType,
		CVSSVersions:   data.CVSSVersions,
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
	var customers []uuid.UUID
	for _, uc := range user.Customers {
		customers = append(customers, uc.ID)
	}
	if user.Role == mongo.ROLE_ADMIN {
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
	for i := range assessments {
		for _, userAssessment := range user.Assessments {
			if userAssessment.ID == assessments[i].ID {
				assessments[i].IsOwned = true
				break
			}
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
		fmt.Printf("i: %d, userAssessment: %+v\n", i, userAssessment)
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
	for i := range assessments {
		for _, userAssessment := range user.Assessments {
			if userAssessment.ID == assessments[i].ID {
				assessments[i].IsOwned = true
				break
			}
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
	var targets []mongo.Target
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

	// update assessment in database
	err := d.mongo.Assessment().Update(assessment.ID, &mongo.Assessment{
		Name:           data.Name,
		StartDateTime:  data.StartDateTime,
		EndDateTime:    data.EndDateTime,
		Targets:        targets,
		Status:         data.Status,
		AssessmentType: data.AssessmentType,
		CVSSVersions:   data.CVSSVersions,
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
	assessment, errStr := d.assessmentFromParam(c.Params("assessment"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
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
		Type string `json:"type"`
	}

	data := &reqData{}
	if err := c.BodyParser(data); err != nil {
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

	// retrieve vulnerabilities
	vulnerabilities, err := d.mongo.Vulnerability().GetByAssessmentID(assessment.ID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Failed to retrieve vulnerabilities",
		})
	}

	// retrieve pocs
	var pocs []mongo.Poc
	for _, v := range vulnerabilities {
		var cvssReportVersion int
		for _, version := range assessment.CVSSVersions {
			cvssVersionInt, err := strconv.Atoi(version)
			if err != nil {
				c.Status(fiber.StatusBadRequest)
				return c.JSON(fiber.Map{
					"error": "Invalid CVSS version",
				})
			}

			if cvssVersionInt > cvssReportVersion {
				switch version {
				case cvss.CVSS4:
					v.CVSSReport = v.CVSSv4
					cvssReportVersion = cvssVersionInt
				case cvss.CVSS31:
					v.CVSSReport = v.CVSSv31
					cvssReportVersion = cvssVersionInt
				case cvss.CVSS3:
					v.CVSSReport = v.CVSSv3
					cvssReportVersion = cvssVersionInt
				case cvss.CVSS2:
					v.CVSSReport = v.CVSSv2
					cvssReportVersion = cvssVersionInt
				}
			}
		}

		pocsByVuln, err := d.mongo.Poc().GetByVulnerabilityID(v.ID)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Failed to retrieve pocs",
			})
		}
		pocs = append(pocs, pocsByVuln...)
	}

	// generate report
	var fileName string
	switch data.Type {
	case "xlsx":
		fileName, err = xlsx.GenerateReport(customer, assessment, vulnerabilities, pocs)
	}
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Failed to generate report",
		})
	}

	c.Status(fiber.StatusOK)
	return c.SendFile(fileName)
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

func (d *Driver) validateAssessmentData(data *assessmentRequestData, defaultCVSSVersions []string) string {
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
		data.CVSSVersions = defaultCVSSVersions
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
