package api

import (
	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/gofiber/fiber/v2"
)

func (d *Driver) AddCustomer(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	if user.Role != mongo.ROLE_ADMIN {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

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
			"error": "Cannot create customer",
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message": "Customer created",
	})
}

func (d *Driver) GetAllCustomers(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	userCustomers := user.Customers
	if user.Role == mongo.ROLE_ADMIN {
		userCustomers = nil
	}

	customers, err := d.mongo.Customer().GetAll(userCustomers)

	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get customers",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(customers)
}
