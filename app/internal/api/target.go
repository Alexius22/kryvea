package api

import (
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
)

func (d *Driver) AddTarget(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	type reqData struct {
		IP         string `json:"ip"`
		Port       int    `json:"port"`
		Protocol   string `json:"protocol"`
		Hostname   string `json:"hostname"`
		CustomerID string `json:"customer_id"`
	}
	target := &reqData{}
	if err := c.BodyParser(target); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if target.CustomerID == "" || (target.IP == "" && target.Hostname == "") {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Customer and IP/Hostname are required",
		})
	}

	customerID, err := util.ParseMongoID(target.CustomerID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	if !util.CanAccessCustomer(user, customerID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	err = d.mongo.Target().Insert(&mongo.Target{
		IP:         target.IP,
		Port:       target.Port,
		Protocol:   target.Protocol,
		Hostname:   target.Hostname,
		CustomerID: customerID,
	})
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot create target",
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message": "Target created",
	})
}

func (d *Driver) UpdateTarget(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	type reqData struct {
		IP       string `json:"ip"`
		Port     int    `json:"port"`
		Protocol string `json:"protocol"`
		Hostname string `json:"hostname"`
	}
	target := &reqData{}
	if err := c.BodyParser(target); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	targetParam := c.Params("target")
	if targetParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Target ID is required",
		})
	}

	targetID, err := util.ParseMongoID(targetParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid target ID",
		})
	}

	if target.IP == "" && target.Hostname == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "IP/Hostname is required",
		})
	}

	targetData, err := d.mongo.Target().GetByID(targetID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot get target",
		})
	}

	if !util.CanAccessCustomer(user, targetData.CustomerID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	err = d.mongo.Target().Update(targetID, &mongo.Target{
		IP:       target.IP,
		Port:     target.Port,
		Protocol: target.Protocol,
		Hostname: target.Hostname,
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

	targetParam := c.Params("target")
	if targetParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Target ID is required",
		})
	}

	targetID, err := util.ParseMongoID(targetParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid target ID",
		})
	}

	targetData, err := d.mongo.Target().GetByID(targetID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot get target",
		})
	}

	if !util.CanAccessCustomer(user, targetData.CustomerID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	err = d.mongo.Target().Delete(targetID)
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

func (d *Driver) SearchTargets(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	customer := c.Params("customer")
	if customer == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Customer ID is required",
		})
	}

	customerID, err := util.ParseMongoID(customer)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	if !util.CanAccessCustomer(user, customerID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	query := c.Query("query")
	if query == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Query is required",
		})
	}

	target, err := d.mongo.Target().Search(customerID, query)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get target",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(target)
}

func (d *Driver) GetAllTargets(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	customer := c.Params("customer")
	if customer == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Target ID is required",
		})
	}

	customerID, err := util.ParseMongoID(customer)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid target ID",
		})
	}

	if !util.CanAccessCustomer(user, customerID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	targets, err := d.mongo.Target().GetByCustomerID(customerID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get targets",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(targets)

}
