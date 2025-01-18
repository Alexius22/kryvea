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
	type reqData struct {
		Name          string    `json:"name"`
		Notes         string    `json:"notes"`
		StartDateTime time.Time `json:"start_date_time"`
		EndDateTime   time.Time `json:"end_date_time"`
		Status        string    `json:"status"`
		Targets       []string  `json:"targets"`
		Type          string    `json:"type"`
		CVSSVersion   int       `json:"cvss_version"`
		Environment   string    `json:"environment"`
		Network       string    `json:"network"`
		Method        string    `json:"method"`
		OSSTMMVector  string    `json:"osstmm_vector"`
		CustomerID    string    `json:"customer_id"`
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
		assessment.StartDateTime = time.Now()
	}

	if assessment.CustomerID == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Customer ID is required",
		})
	}

	assessmentId, err := util.ParseMongoID(assessment.CustomerID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	customer, err := d.mongo.Customer().GetByID(assessmentId)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	if assessment.CVSSVersion == 0 {
		assessment.CVSSVersion = customer.DefaultCVSSVersion
	}

	if !cvss.IsValidVersion(assessment.CVSSVersion) {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid CVSS version",
		})
	}

	var targets []primitive.ObjectID
	for _, target := range assessment.Targets {
		targetId, err := util.ParseMongoID(target)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Invalid target ID",
			})
		}
		targets = append(targets, targetId)
	}

	err = d.mongo.Assessment().Insert(&mongo.Assessment{
		Name:          assessment.Name,
		Notes:         assessment.Notes,
		StartDateTime: assessment.StartDateTime,
		EndDateTime:   assessment.EndDateTime,
		Targets:       targets,
		Status:        assessment.Status,
		Type:          assessment.Type,
		CVSSVersion:   assessment.CVSSVersion,
		Environment:   assessment.Environment,
		Network:       assessment.Network,
		Method:        assessment.Method,
		OSSTMMVector:  assessment.OSSTMMVector,
		CustomerID:    assessmentId,
	})
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot create customer",
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message": "Customer created",
	})
}

func (d *Driver) SearchAssessments(c *fiber.Ctx) error {
	name := c.Query("name")
	if name == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Name is required",
		})
	}

	assessments, err := d.mongo.Assessment().Search(name)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot search assessments",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(assessments)
}

func (d *Driver) GetAllAssessments(c *fiber.Ctx) error {
	customer := c.Params("customer")
	if customer == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Customer ID is required",
		})
	}

	customerId, err := util.ParseMongoID(customer)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	assessments, err := d.mongo.Assessment().GetByCustomerID(customerId)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get assessments",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(assessments)
}
