package api

import (
	"time"

	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (d *Driver) AddAssessment(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	type reqData struct {
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

	assessment := &reqData{}
	if err := c.BodyParser(assessment); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if assessment.Name == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Name is required",
		})
	}

	if assessment.StartDateTime.IsZero() {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Start date is required",
		})
	}

	if assessment.EndDateTime.IsZero() {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "End date is required",
		})
	}

	customerParam := c.Params("customer")
	if customerParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Customer ID is required",
		})
	}

	customerID, err := util.ParseMongoID(customerParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	_, err = d.mongo.Customer().GetByID(customerID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	if !util.CanAccessCustomer(user, customerID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	customer, err := d.mongo.Customer().GetByID(customerID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	if assessment.CVSSVersion == "" {
		assessment.CVSSVersion = customer.DefaultCVSSVersion
	}

	if !cvss.IsValidVersion(assessment.CVSSVersion) {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid CVSS version",
		})
	}

	var targets []mongo.AssessmentTarget
	for _, target := range assessment.Targets {
		targetID, err := util.ParseMongoID(target)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Invalid target ID",
			})
		}
		targets = append(targets, mongo.AssessmentTarget{ID: targetID})
	}

	assessmentID, err := d.mongo.Assessment().Insert(&mongo.Assessment{
		Name:           assessment.Name,
		StartDateTime:  assessment.StartDateTime,
		EndDateTime:    assessment.EndDateTime,
		Targets:        targets,
		Status:         assessment.Status,
		AssessmentType: assessment.AssessmentType,
		CVSSVersion:    assessment.CVSSVersion,
		Environment:    assessment.Environment,
		TestingType:    assessment.TestingType,
		OSSTMMVector:   assessment.OSSTMMVector,
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

	name := c.Query("name")
	if name == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Name is required",
		})
	}

	var customers []primitive.ObjectID
	for _, uc := range user.Customers {
		customers = append(customers, uc.ID)
	}
	if user.Role == mongo.ROLE_ADMIN {
		customers = nil
	}

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

	customer := c.Params("customer")
	if customer == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Customer ID is required",
		})
	}

	customerID, err := util.ParseMongoID(customer)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	_, err = d.mongo.Customer().GetByID(customerID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	if !util.CanAccessCustomer(user, customerID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	assessments, err := d.mongo.Assessment().GetByCustomerID(customerID)
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

	type reqData struct {
		Name           string    `json:"name"`
		StartDateTime  time.Time `json:"start_date_time"`
		EndDateTime    time.Time `json:"end_date_time"`
		Targets        []string  `json:"targets"`
		Status         string    `json:"status"`
		AssessmentType string    `json:"assessment_type"`
		CVSSVersion    string    `json:"cvss_version"`
		Environment    string    `json:"environment"`
		TestingType    string    `json:"testing_type"`
		OSSTMMVector   string    `json:"osstmm_vector"`
	}

	data := &reqData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	customerParam := c.Params("customer")
	if customerParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Customer ID is required",
		})
	}

	customerID, err := util.ParseMongoID(customerParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	_, err = d.mongo.Customer().GetByID(customerID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	if !util.CanAccessCustomer(user, customerID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	assessmentParam := c.Params("assessment")
	if assessmentParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Assessment ID is required",
		})
	}

	assessmentID, err := util.ParseMongoID(assessmentParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid assessment ID",
		})
	}

	_, err = d.mongo.Assessment().GetByID(assessmentID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid assessment ID",
		})
	}

	if data.Name == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Name is required",
		})
	}

	if data.StartDateTime.IsZero() {
		data.StartDateTime = time.Now()
	}

	customer, err := d.mongo.Customer().GetByID(customerID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	if data.CVSSVersion == "" {
		data.CVSSVersion = customer.DefaultCVSSVersion
	}

	if !cvss.IsValidVersion(data.CVSSVersion) {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid CVSS version",
		})
	}

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

	err = d.mongo.Assessment().Update(assessmentID, &mongo.Assessment{
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

	customerParam := c.Params("customer")
	if customerParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Customer ID is required",
		})
	}

	customerID, err := util.ParseMongoID(customerParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	_, err = d.mongo.Customer().GetByID(customerID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	if !util.CanAccessCustomer(user, customerID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	assessmentParam := c.Params("assessment")
	if assessmentParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Assessment ID is required",
		})
	}

	assessmentID, err := util.ParseMongoID(assessmentParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid assessment ID",
		})
	}

	_, err = d.mongo.Assessment().GetByID(assessmentID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid assessment ID",
		})
	}

	err = d.mongo.Assessment().Delete(assessmentID)
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
