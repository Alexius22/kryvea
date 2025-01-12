package api

import (
	"github.com/Alexius22/kryvea/internal/config"
	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/db"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func AddCustomer(c *fiber.Ctx) error {
	type reqData struct {
		Name               string `json:"name"`
		Lang               string `json:"lang"`
		DefaultCVSSVersion int    `json:"default_cvss_version"`
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

	if customer.DefaultCVSSVersion == 0 {
		customer.DefaultCVSSVersion = config.Conf.Customer.DefaultCVSSVersion
	}

	if !cvss.IsValidVersion(customer.DefaultCVSSVersion) {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid CVSS version",
		})
	}

	err := db.AddCustomer(db.Customer{
		Model: db.Model{
			ID: uuid.New().String(),
		},
		Name:               customer.Name,
		Lang:               customer.Lang,
		DefaultCVSSVersion: customer.DefaultCVSSVersion,
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
