package api

import (
	"fmt"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type customerRequestData struct {
	Name     string `json:"name"`
	Language string `json:"language"`
}

func (d *Driver) AddCustomer(c *fiber.Ctx) error {
	// parse request body
	data := &customerRequestData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	errStr := d.validateCustomerData(data)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	customer := &mongo.Customer{
		Name:     data.Name,
		Language: data.Language,
	}

	// insert customer into database
	customerID, err := d.mongo.Customer().Insert(customer)
	if err != nil {
		c.Status(fiber.StatusBadRequest)

		if mongo.IsDuplicateKeyError(err) {
			return c.JSON(fiber.Map{
				"error": fmt.Sprintf("Customer \"%s\" already exists", customer.Name),
			})
		}

		return c.JSON(fiber.Map{
			"error": "Cannot create customer",
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message":     "Customer created",
		"customer_id": customerID,
	})
}

func (d *Driver) GetCustomer(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// get customer from param
	customer, errStr := d.customerFromParam(c.Params("customer"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// check if user has access to the customer
	if !user.CanAccessCustomer(customer.ID) {
		c.Status(fiber.StatusForbidden)
		return c.JSON(fiber.Map{
			"error": "Forbidden",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(customer)
}

func (d *Driver) GetCustomers(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// retrieve user's customers
	userCustomers := []uuid.UUID{}
	for _, uc := range user.Customers {
		userCustomers = append(userCustomers, uc.ID)
	}
	if user.Role == mongo.RoleAdmin {
		userCustomers = nil
	}

	// get customers from database
	customers, err := d.mongo.Customer().GetAll(userCustomers)
	if err != nil {
		d.logger.Error().Err(err).Msg("Cannot get customers")
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get customers",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(customers)
}

func (d *Driver) UpdateCustomer(c *fiber.Ctx) error {
	// parse customer param
	customer, errStr := d.customerFromParam(c.Params("customer"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// parse request body
	data := &customerRequestData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	errStr = d.validateCustomerData(data)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	newCustomer := &mongo.Customer{
		Name:     data.Name,
		Language: data.Language,
	}

	// insert customer into database
	err := d.mongo.Customer().Update(customer.ID, newCustomer)
	if err != nil {
		d.logger.Error().Err(err).Msg("Cannot update customer")
		c.Status(fiber.StatusInternalServerError)

		if mongo.IsDuplicateKeyError(err) {
			return c.JSON(fiber.Map{
				"error": fmt.Sprintf("Customer \"%s\" already exists", newCustomer.Name),
			})
		}

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
	// parse customer param
	customer, errStr := d.customerFromParam(c.Params("customer"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	err := d.mongo.Customer().Delete(customer.ID)
	if err != nil {
		d.logger.Error().Err(err).Msg("Cannot delete customer")
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

func (d *Driver) customerFromParam(customerParam string) (*mongo.Customer, string) {
	if customerParam == "" {
		return nil, "Customer ID is required"
	}

	customerID, err := util.ParseUUID(customerParam)
	if err != nil {
		return nil, "Invalid customer ID"
	}

	customer, err := d.mongo.Customer().GetByIDPipeline(customerID)
	if err != nil {
		return nil, "Invalid customer ID"
	}

	return customer, ""
}

func (d *Driver) validateCustomerData(customer *customerRequestData) string {
	if customer.Name == "" {
		return "Name is required"
	}

	if customer.Language == "" {
		return "Language is required"
	}

	return ""
}
