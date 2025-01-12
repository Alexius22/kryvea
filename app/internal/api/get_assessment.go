package api

import (
	"github.com/Alexius22/kryvea/internal/db"
	"github.com/gofiber/fiber/v2"
)

func GetAllAssessments(c *fiber.Ctx) error {
	type reqData struct {
		CustomerID string `json:"customer_id"`
	}

	data := &reqData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if data.CustomerID == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Customer ID is required",
		})
	}

	assessments, err := db.GetAllAssessmentsByCustomerID(data.CustomerID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Failed to retrieve assessments",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(assessments)
}
