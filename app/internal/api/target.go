package api

import (
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
)

func (d *Driver) AddTarget(c *fiber.Ctx) error {
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

	customerId, err := util.ParseMongoID(target.CustomerID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	err = d.mongo.Target().Insert(&mongo.Target{
		IP:         target.IP,
		Port:       target.Port,
		Protocol:   target.Protocol,
		Hostname:   target.Hostname,
		CustomerID: customerId,
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

func (d *Driver) SearchTarget(c *fiber.Ctx) error {
	query := c.Query("query")
	if query == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Query is required",
		})
	}

	target, err := d.mongo.Target().Search(query)
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
	customer := c.Params("customer")
	if customer == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Target ID is required",
		})
	}

	targetId, err := util.ParseMongoID(customer)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid target ID",
		})
	}

	targets, err := d.mongo.Target().GetByCustomerID(targetId)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get targets",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(targets)

}
