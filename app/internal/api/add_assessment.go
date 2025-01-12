package api

import (
	"time"

	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/db"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func AddAssessment(c *fiber.Ctx) error {
	type reqData struct {
		Name          string    `json:"name"`
		StartDateTime time.Time `json:"start_date_time"`
		EndDateTime   time.Time `json:"end_date_time"`
		Type          string    `json:"type"`
		CustomerID    string    `json:"customer_id"`
		CVSSVersion   int       `json:"cvss_version"`
	}

	assessment := &reqData{}
	if err := c.BodyParser(assessment); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if assessment.Name == "" || assessment.Type == "" || assessment.CustomerID == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Name, Type and Customer ID are required",
		})
	}

	if assessment.StartDateTime.IsZero() {
		assessment.StartDateTime = time.Now()
	}

	customer, err := db.GetCustomerByID(assessment.CustomerID)
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

	err = db.AddAssessment(db.Assessment{
		Model: db.Model{
			ID: uuid.New().String(),
		},
		Name:          assessment.Name,
		StartDateTime: assessment.StartDateTime,
		EndDateTime:   assessment.EndDateTime,
		Type:          assessment.Type,
		Status:        "pending",
		CVSSVersion:   assessment.CVSSVersion,
		CustomerID:    customer.ID,
		Customer:      customer,
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
