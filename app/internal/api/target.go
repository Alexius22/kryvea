package api

import (
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
)

type targetRequestData struct {
	IPv4       string `json:"ipv4"`
	IPv6       string `json:"ipv6"`
	Port       int    `json:"port"`
	Protocol   string `json:"protocol"`
	FQDN       string `json:"fqdn"`
	Name       string `json:"name"`
	CustomerID string `json:"customer_id"`
}

func (d *Driver) AddTarget(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse request body
	data := &targetRequestData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	errStr := d.validateTargetData(data)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// check if user has access to customer
	customer, errStr := d.customerFromParam(data.CustomerID)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	if !util.CanAccessCustomer(user, customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// inseert target into database
	targetID, err := d.mongo.Target().Insert(&mongo.Target{
		IPv4:     data.IPv4,
		IPv6:     data.IPv6,
		Port:     data.Port,
		Protocol: data.Protocol,
		FQDN:     data.FQDN,
		Name:     data.Name,
	}, customer.ID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot create target",
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message":   "Target created",
		"target_id": targetID,
	})
}

func (d *Driver) UpdateTarget(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse target param
	target, errStr := d.targetFromParam(c.Params("target"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// check if user has access to customer
	if !util.CanAccessCustomer(user, target.Customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// parse request body
	data := &targetRequestData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	errStr = d.validateTargetData(data)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// update target in database
	err := d.mongo.Target().Update(target.ID, &mongo.Target{
		IPv4:     data.IPv4,
		IPv6:     data.IPv6,
		Port:     data.Port,
		Protocol: data.Protocol,
		FQDN:     data.FQDN,
		Name:     data.Name,
	})
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot update target",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "Target updated",
	})
}

func (d *Driver) DeleteTarget(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse target param
	target, errStr := d.targetFromParam(c.Params("target"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// check if user has access to customer
	if !util.CanAccessCustomer(user, target.Customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// delete target from database
	err := d.mongo.Target().Delete(target.ID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot delete target",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "Target deleted",
	})
}

func (d *Driver) GetTargetsByCustomer(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// check if user has access to customer
	customer, errStr := d.customerFromParam(c.Params("customer"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	if !util.CanAccessCustomer(user, customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	targets, err := d.mongo.Target().Search(customer.ID, c.Query("search"))
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get targets",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(targets)
}

func (d *Driver) GetTarget(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse target param
	targetParam := c.Params("target")
	if targetParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Target ID is required",
		})
	}

	targetID, err := util.ParseUUID(targetParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid target ID",
		})
	}

	// get target by customer and ID from database
	target, err := d.mongo.Target().GetByIDPipeline(targetID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get target",
		})
	}

	if !util.CanAccessCustomer(user, target.Customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(target)
}

func (d *Driver) targetFromParam(targetParam string) (*mongo.Target, string) {
	if targetParam == "" {
		return nil, "Target ID is required"
	}

	targetID, err := util.ParseUUID(targetParam)
	if err != nil {
		return nil, "Invalid target ID"
	}

	target, err := d.mongo.Target().GetByIDPipeline(targetID)
	if err != nil {
		return nil, "Invalid target ID"
	}

	return target, ""
}

func (d *Driver) validateTargetData(data *targetRequestData) string {
	if data.FQDN == "" {
		return "FQDN is required"
	}

	if data.IPv4 != "" && !util.IsValidIPv4(data.IPv4) {
		return "Invalid IPv4 address"
	}

	if data.IPv6 != "" && !util.IsValidIPv6(data.IPv6) {
		return "Invalid IPv6 address"
	}

	return ""
}
