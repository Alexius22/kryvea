package api

import (
	"github.com/Alexius22/kryvea/internal/db"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func AddCustomer(c *fiber.Ctx) error {
	type reqData struct {
		Name string `json:"name"`
		Lang string `json:"lang"`
	}

	customer := &reqData{}
	if err := c.BodyParser(customer); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if customer.Name == "" || customer.Lang == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Name and Language are required",
		})
	}

	err := db.AddCustomer(db.Customer{
		Model: db.Model{
			ID: uuid.New().String(),
		},
		Name: customer.Name,
		Lang: customer.Lang,
	})
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message": "Customer created",
	})
}
