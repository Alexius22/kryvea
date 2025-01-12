package api

import (
	"github.com/Alexius22/kryvea/internal/db"
	"github.com/gofiber/fiber/v2"
)

func GetAllTargets(c *fiber.Ctx) error {
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

	targets, err := db.GetAllTargetsByCustomerID(data.CustomerID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Failed to retrieve targets",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(targets)
}
