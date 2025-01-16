package api

import (
	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/gofiber/fiber/v2"
)

func (d *Driver) AddCustomer(c *fiber.Ctx) error {
	type reqData struct {
		Name               string `json:"name"`
		Language           string `json:"language"`
		DefaultCVSSVersion int    `json:"default_cvss_version"`
	}

	customer := &reqData{}
	if err := c.BodyParser(customer); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if customer.Name == "" || customer.Language == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Name and Language are required",
		})
	}

	if customer.DefaultCVSSVersion == 0 {
		customer.DefaultCVSSVersion = cvss.CVSS4
	}

	if !cvss.IsValidVersion(customer.DefaultCVSSVersion) {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid CVSS version",
		})
	}

	err := d.mongo.Customer().Insert(&mongo.Customer{
		Name:               customer.Name,
		Language:           customer.Language,
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

func (d *Driver) GetAllCustomers(c *fiber.Ctx) error {
	customers, err := d.mongo.Customer().GetAll()
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(customers)
}
