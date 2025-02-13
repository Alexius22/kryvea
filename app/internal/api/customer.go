package api

import (
	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
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
		DefaultCVSSVersion string `json:"default_cvss_version"`
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

	if customer.DefaultCVSSVersion == "" {
		customer.DefaultCVSSVersion = cvss.CVSS4
	}

	if !cvss.IsValidVersion(customer.DefaultCVSSVersion) {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid CVSS version",
		})
	}

	customerID, err := d.mongo.Customer().Insert(&mongo.Customer{
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
		"message":     "Customer created",
		"customer_id": customerID.Hex(),
	})
}

func (d *Driver) GetAllCustomers(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	var userCustomers []primitive.ObjectID
	for _, uc := range user.Customers {
		userCustomers = append(userCustomers, uc.ID)
	}
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

	if len(customers) == 0 {
		customers = []mongo.Customer{}
	}

	c.Status(fiber.StatusOK)
	return c.JSON(customers)
}

func (d *Driver) UpdateCustomer(c *fiber.Ctx) error {
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
		DefaultCVSSVersion string `json:"default_cvss_version"`
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

	if customer.DefaultCVSSVersion == "" {
		customer.DefaultCVSSVersion = cvss.CVSS4
	}

	if !cvss.IsValidVersion(customer.DefaultCVSSVersion) {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid CVSS version",
		})
	}

	customerID, err := util.ParseMongoID(c.Params("customer"))
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	err = d.mongo.Customer().Update(customerID, &mongo.Customer{
		Name:               customer.Name,
		Language:           customer.Language,
		DefaultCVSSVersion: customer.DefaultCVSSVersion,
	})
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot update customer",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "Customer updated",
	})
}

func (d *Driver) DeleteCustomer(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	if user.Role != mongo.ROLE_ADMIN {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	customerParam := c.Params("customer")
	if customerParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Customer ID is required",
		})
	}

	customerID, err := util.ParseMongoID(customerParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	err = d.mongo.Customer().Delete(customerID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot delete customer",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "Customer deleted",
	})
}
