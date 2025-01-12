package api

import (
	"github.com/Alexius22/kryvea/internal/db"
	"github.com/gofiber/fiber/v2"
)

func GetAllCustomers(c *fiber.Ctx) error {
	customers, err := db.GetAllCustomers()
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(customers)
}
