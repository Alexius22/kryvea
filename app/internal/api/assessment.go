package api

import (
	"time"

	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/report/xlsx"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type assessmentRequestData struct {
	Name           string    `json:"name"`
	StartDateTime  time.Time `json:"start_date_time"`
	EndDateTime    time.Time `json:"end_date_time"`
	Status         string    `json:"status"`
	Targets        []string  `json:"targets"`
	AssessmentType string    `json:"assessment_type"`
	CVSSVersion    string    `json:"cvss_version"`
	Environment    string    `json:"environment"`
	TestingType    string    `json:"testing_type"`
	OSSTMMVector   string    `json:"osstmm_vector"`
}

func (d *Driver) AddAssessment(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// check if user has access to customer
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

	// parse request body
	data := &assessmentRequestData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	errStr = d.validateAssessmentData(data, customer.DefaultCVSSVersion)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// parse targets
	var targets []mongo.AssessmentTarget
	for _, target := range data.Targets {
		targetID, err := util.ParseMongoID(target)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Invalid target ID",
			})
		}
		targets = append(targets, mongo.AssessmentTarget{ID: targetID})
	}

	// insert assessment into database
	assessmentID, err := d.mongo.Assessment().Insert(&mongo.Assessment{
		Name:           data.Name,
		StartDateTime:  data.StartDateTime,
		EndDateTime:    data.EndDateTime,
		Targets:        targets,
		Status:         data.Status,
		AssessmentType: data.AssessmentType,
		CVSSVersion:    data.CVSSVersion,
		Environment:    data.Environment,
		TestingType:    data.TestingType,
		OSSTMMVector:   data.OSSTMMVector,
		Customer: mongo.AssessmentCustomer{
			ID: customer.ID,
		},
	})
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot create assessment",
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message":       "Assessment created",
		"assessment_id": assessmentID.Hex(),
	})
}

func (d *Driver) SearchAssessments(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse name param
	name := c.Query("name")
	if name == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Name is required",
		})
	}

	// retrieve user's customers
	var customers []bson.ObjectID
	for _, uc := range user.Customers {
		customers = append(customers, uc.ID)
	}
	if user.Role == mongo.ROLE_ADMIN {
		customers = nil
	}

	// retrieve assessments
	assessments, err := d.mongo.Assessment().Search(customers, name)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot search assessments",
		})
	}

	if len(assessments) == 0 {
		assessments = []mongo.Assessment{}
	}

	c.Status(fiber.StatusOK)
	return c.JSON(assessments)
}

func (d *Driver) GetAssessmentsByCustomer(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// check if user has access to customer
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
			"error": "Cannot get assessments",
		})
	}

	if len(assessments) == 0 {
		assessments = []mongo.Assessment{}
	}

	c.Status(fiber.StatusOK)
	return c.JSON(assessments)
}

func (d *Driver) UpdateAssessment(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// check if user has access to customer
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
	errStr = d.validateAssessmentData(data, customer.DefaultCVSSVersion)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// parse targets
	var targets []mongo.AssessmentTarget
	for _, target := range data.Targets {
		targetID, err := util.ParseMongoID(target)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Invalid target ID",
			})
		}
		targets = append(targets, mongo.AssessmentTarget{ID: targetID})
	}

	err := d.mongo.Assessment().Update(assessment.ID, &mongo.Assessment{
		Name:           data.Name,
		StartDateTime:  data.StartDateTime,
		EndDateTime:    data.EndDateTime,
		Targets:        targets,
		Status:         data.Status,
		AssessmentType: data.AssessmentType,
		CVSSVersion:    data.CVSSVersion,
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

	// check if user has access to customer
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

	// parse assessment param
	assessment, errStr := d.assessmentFromParam(c.Params("assessment"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// delete assessment
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

	// check if user has access to customer
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

	// parse assessment param
	assessment, errStr := d.assessmentFromParam(c.Params("assessment"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// check if assessment belongs to customer
	if assessment.Customer.ID != customer.ID {
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
		"assessment_id": cloneAssessmentID.Hex(),
	})
}

func (d *Driver) ExportAssessment(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// check if user has access to customer
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

	// parse assessment param
	assessment, errStr := d.assessmentFromParam(c.Params("assessment"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// check if assessment belongs to customer
	if assessment.Customer.ID != customer.ID {
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
		switch assessment.CVSSVersion {
		case cvss.CVSS2:
			v.CVSSReport = v.CVSSv2
		case cvss.CVSS3:
			v.CVSSReport = v.CVSSv3
		case cvss.CVSS31:
			v.CVSSReport = v.CVSSv31
		case cvss.CVSS4:
			v.CVSSReport = v.CVSSv4
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
	return c.JSON(fiber.Map{
		"message": "Report generated",
		"file":    fileName,
	})
}

func (d *Driver) assessmentFromParam(assessmentParam string) (*mongo.Assessment, string) {
	if assessmentParam == "" {
		return nil, "assessment ID is required"
	}

	assessmentID, err := util.ParseMongoID(assessmentParam)
	if err != nil {
		return nil, "Invalid assessment ID"
	}

	assessment, err := d.mongo.Assessment().GetByID(assessmentID)
	if err != nil {
		return nil, "Invalid assessment ID"
	}

	return assessment, ""
}

func (d *Driver) validateAssessmentData(data *assessmentRequestData, defaultCVSSVersion string) string {
	if data.Name == "" {
		return "Name is required"
	}

	if data.StartDateTime.IsZero() {
		return "Start date is required"
	}

	if data.EndDateTime.IsZero() {
		return "End date is required"
	}

	if data.CVSSVersion == "" {
		data.CVSSVersion = defaultCVSSVersion
	}

	if !cvss.IsValidVersion(data.CVSSVersion) {
		return "Invalid CVSS version"
	}

	return ""
}
