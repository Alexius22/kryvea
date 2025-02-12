package api

import (
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/poc"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
)

func (d *Driver) AddPoc(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	type reqData struct {
		Index           int    `json:"index" bson:"index"`
		Type            string `json:"type" bson:"type"`
		Title           string `json:"title" bson:"title"`
		Description     string `json:"description" bson:"description"`
		Content         string `json:"content" bson:"content"`
		URL             string `json:"url" bson:"url"`
		VulnerabilityID string `json:"vulnerability_id" bson:"vulnerability_id"`
	}

	pocData := &reqData{}
	if err := c.BodyParser(pocData); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	vulnerabilityID, err := util.ParseMongoID(pocData.VulnerabilityID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid vulnerability ID",
		})
	}

	vulnerability, err := d.mongo.Vulnerability().GetByID(vulnerabilityID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid vulnerability ID",
		})
	}

	assessment, err := d.mongo.Assessment().GetByID(vulnerability.Assessment.ID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid vulnerability",
		})
	}

	if !util.CanAccessCustomer(user, assessment.Customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	if pocData.Type == "" || pocData.Content == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Type and Content are required",
		})
	}

	if poc.IsValidType(pocData.Type) == false {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid type",
		})
	}

	pocID, err := d.mongo.Poc().Insert(&mongo.Poc{
		Index:           pocData.Index,
		Type:            pocData.Type,
		Title:           pocData.Title,
		Description:     pocData.Description,
		Content:         pocData.Content,
		URL:             pocData.URL,
		VulnerabilityID: vulnerabilityID,
	})
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot create PoC",
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message": "PoC created",
		"poc_id":  pocID.Hex(),
	})
}

func (d *Driver) UpdatePoc(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	type reqData struct {
		Index       int    `json:"index" bson:"index"`
		Type        string `json:"type" bson:"type"`
		Title       string `json:"title" bson:"title"`
		Description string `json:"description" bson:"description"`
		Content     string `json:"content" bson:"content"`
		URL         string `json:"url" bson:"url"`
	}

	pocData := &reqData{}
	if err := c.BodyParser(pocData); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	pocParam := c.Params("poc")
	if pocParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "PoC ID is required",
		})
	}

	pocID, err := util.ParseMongoID(pocParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid PoC ID",
		})
	}

	oldPoc, err := d.mongo.Poc().GetByID(pocID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid PoC ID",
		})
	}

	vulnerability, err := d.mongo.Vulnerability().GetByID(oldPoc.VulnerabilityID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid vulnerability ID",
		})
	}

	assessment, err := d.mongo.Assessment().GetByID(vulnerability.Assessment.ID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid vulnerability",
		})
	}

	if !util.CanAccessCustomer(user, assessment.Customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	if pocData.Type == "" || pocData.Content == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Type and Content are required",
		})
	}

	if poc.IsValidType(pocData.Type) == false {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid type",
		})
	}

	err = d.mongo.Poc().Update(pocID, &mongo.Poc{
		Index:       pocData.Index,
		Type:        pocData.Type,
		Title:       pocData.Title,
		Description: pocData.Description,
		Content:     pocData.Content,
		URL:         pocData.URL,
	})
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Failed to update PoC",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "PoC updated",
	})
}

func (d *Driver) DeletePoc(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	pocParam := c.Params("poc")
	if pocParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "PoC ID is required",
		})
	}

	pocID, err := util.ParseMongoID(pocParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid PoC ID",
		})
	}

	poc, err := d.mongo.Poc().GetByID(pocID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid PoC ID",
		})
	}

	vulnerability, err := d.mongo.Vulnerability().GetByID(poc.VulnerabilityID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid PoC",
		})
	}

	assessment, err := d.mongo.Assessment().GetByID(vulnerability.Assessment.ID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid PoC",
		})
	}

	if !util.CanAccessCustomer(user, assessment.Customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	err = d.mongo.Poc().Delete(pocID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot delete PoC",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "PoC deleted",
	})
}

func (d *Driver) GetAllPocs(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	vulnerabilityParam := c.Params("vulnerability")
	if vulnerabilityParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Vulnerability ID is required",
		})
	}

	vulnerabilityID, err := util.ParseMongoID(vulnerabilityParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid vulnerability ID",
		})
	}

	vulnerability, err := d.mongo.Vulnerability().GetByID(vulnerabilityID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid vulnerability ID",
		})
	}

	assessment, err := d.mongo.Assessment().GetByID(vulnerability.Assessment.ID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid vulnerability",
		})
	}

	if !util.CanAccessCustomer(user, assessment.Customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	pocs, err := d.mongo.Poc().GetByVulnerabilityID(vulnerabilityID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get PoCs",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(pocs)
}
