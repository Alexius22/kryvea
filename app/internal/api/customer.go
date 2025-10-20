package api

import (
	"context"
	"errors"
	"fmt"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/bytedance/sonic"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type customerRequestData struct {
	Name     string `json:"name"`
	Language string `json:"language"`
	LogoID   string `json:"logo_id"`
}

func (d *Driver) AddCustomer(c *fiber.Ctx) error {
	// parse request body
	data := &customerRequestData{}
	dataStr := c.FormValue("data")
	err := sonic.Unmarshal([]byte(dataStr), &data)
	if err != nil {
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

	session, err := d.mongo.NewSession()
	if err != nil {
		return err
	}
	defer session.End()

	customerID, err := session.WithTransaction(func(ctx context.Context) (any, error) {
		var logoId uuid.UUID
		file, err := c.FormFile("file")
		if file != nil && err == nil {
			logoData, err := d.readFile(file)
			if err != nil {
				return uuid.Nil, errors.New("Cannot read file")
			}

			logoId, err = d.mongo.FileReference().Insert(ctx, logoData, file.Filename)
			if err != nil {
				d.logger.Error().Err(err).Msg("Cannot upload image")
				return uuid.Nil, errors.New("Cannot upload image")
			}
		}

		customer := &mongo.Customer{
			Name:     data.Name,
			Language: data.Language,
			LogoID:   logoId,
		}

		// insert customer into database
		customerID, err := d.mongo.Customer().Insert(ctx, customer)
		if err != nil {
			if mongo.IsDuplicateKeyError(err) {
				return uuid.Nil, fmt.Errorf("Customer \"%s\" already exists", customer.Name)
			}

			return uuid.Nil, errors.New("Cannot create customer")
		}

		return customerID, nil
	})
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message":     "Customer created",
		"customer_id": customerID.(uuid.UUID),
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
	customers, err := d.mongo.Customer().GetAll(context.Background(), userCustomers)
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
	dataStr := c.FormValue("data")
	err := sonic.Unmarshal([]byte(dataStr), &data)
	if err != nil {
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

	logoId, err := util.ParseUUID(data.LogoID)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Failed to parse logoID",
		})
	}

	session, err := d.mongo.NewSession()
	if err != nil {
		return err
	}
	defer session.End()

	_, err = session.WithTransaction(func(ctx context.Context) (any, error) {
		if logoId == uuid.Nil {
			file, err := c.FormFile("file")
			if file != nil && err == nil {
				logoData, err := d.readFile(file)
				if err != nil {
					return nil, errors.New("Cannot read file")
				}

				logoId, err = d.mongo.FileReference().Insert(ctx, logoData, file.Filename)
				if err != nil {
					return nil, errors.New("Cannot upload image")
				}
			}
		}

		newCustomer := &mongo.Customer{
			Name:     data.Name,
			Language: data.Language,
			LogoID:   logoId,
		}

		// update customer in database
		err = d.mongo.Customer().Update(ctx, customer.ID, newCustomer)
		if err != nil {
			if mongo.IsDuplicateKeyError(err) {
				return nil, fmt.Errorf("Customer \"%s\" already exists", newCustomer.Name)
			}

			return nil, errors.New("Cannot update customer")
		}

		return nil, nil
	})
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": err.Error(),
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

	session, err := d.mongo.NewSession()
	if err != nil {
		return err
	}
	defer session.End()

	_, err = session.WithTransaction(func(ctx context.Context) (any, error) {
		err := d.mongo.Customer().Delete(ctx, customer.ID)
		if err != nil {
			d.logger.Error().Err(err).Msg("Cannot delete customer")
			return nil, errors.New("Cannot delete customer")
		}

		return nil, nil
	})
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": err.Error(),
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

	customer, err := d.mongo.Customer().GetByIDPipeline(context.Background(), customerID)
	if err != nil {
		return nil, "Invalid customer ID"
	}

	return customer, ""
}

func (d *Driver) validateCustomerData(customer *customerRequestData) string {
	if customer.Name == "" {
		return "Name is required"
	}

	return ""
}
