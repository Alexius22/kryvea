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

	customerID, err := util.ParseMongoID(assessment.CustomerID)
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
		targetID, err := util.ParseMongoID(target)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Invalid target ID",
			})
		}
		targets = append(targets, targetID)
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
		CustomerID:    customerID,
	})
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot create assessment",
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message": "Assessment created",
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

	customers := user.Customers
	if user.IsAdmin {
		customers = nil
	}

	assessments, err := d.mongo.Assessment().Search(customers, name)
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

	c.Status(fiber.StatusOK)
	return c.JSON(assessments)
}
