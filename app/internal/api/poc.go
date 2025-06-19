package api

import (
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/poc"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type pocRequestData struct {
	Index        int    `json:"index"`
	Type         string `json:"type"`
	Description  string `json:"description"`
	URI          string `json:"uri"`
	Request      string `json:"request"`
	Response     string `json:"response"`
	ImageData    []byte `json:"image_data"`
	ImageCaption string `json:"image_caption"`
	TextLanguage string `json:"text_language"`
	TextData     string `json:"text_data"`
}

func (d *Driver) AddPoc(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse vulnerability param
	vulnerability, errStr := d.vulnerabilityFromParam(c.Params("vulnerability"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// get assessment from database
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

	// parse request body
	data := &pocRequestData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	errStr = d.validateData(data)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// parse image data and insert it into the database
	var imageID uuid.UUID
	if data.Type == poc.POC_TYPE_IMAGE && len(data.ImageData) != 0 {
		imageID, err = d.mongo.FileReference().Insert(data.ImageData)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Cannot upload image",
			})
		}
	}

	// insert poc into the database
	pocID, err := d.mongo.Poc().Insert(&mongo.Poc{
		Index:           data.Index,
		Type:            data.Type,
		Description:     data.Description,
		URI:             data.URI,
		Request:         data.Request,
		Response:        data.Response,
		ImageID:         imageID,
		ImageCaption:    data.ImageCaption,
		TextLanguage:    data.TextLanguage,
		TextData:        data.TextData,
		VulnerabilityID: vulnerability.ID,
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
		"poc_id":  pocID,
	})
}

func (d *Driver) UpdatePoc(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse vulnerability param
	vulnerability, errStr := d.vulnerabilityFromParam(c.Params("vulnerability"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// get assessment from database
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

	// parse poc param
	oldPoc, errStr := d.pocFromParam(c.Params("poc"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// check poc belongs to vulnerability
	if oldPoc.VulnerabilityID != vulnerability.ID {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid PoC ID",
		})
	}

	// parse request body
	data := &pocRequestData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	errStr = d.validateData(data)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// parse image data and insert it into the database
	var imageID uuid.UUID
	if oldPoc.Type == poc.POC_TYPE_IMAGE && len(data.ImageData) != 0 {
		imageID, err = d.mongo.FileReference().Insert(data.ImageData)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Cannot upload image",
			})
		}
	}

	// update poc in the database
	err = d.mongo.Poc().Update(oldPoc.ID, &mongo.Poc{
		Index:        data.Index,
		Description:  data.Description,
		URI:          data.URI,
		Request:      data.Request,
		Response:     data.Response,
		ImageID:      imageID,
		ImageCaption: data.ImageCaption,
		TextLanguage: data.TextLanguage,
		TextData:     data.TextData,
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

	// parse vulnerability param
	vulnerability, errStr := d.vulnerabilityFromParam(c.Params("vulnerability"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// get assessment from database
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

	// parse poc param
	poc, errStr := d.pocFromParam(c.Params("poc"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// check poc belongs to vulnerability
	if poc.VulnerabilityID != vulnerability.ID {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid PoC ID",
		})
	}

	// delete poc from database
	err = d.mongo.Poc().Delete(poc.ID)
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

func (d *Driver) GetPocsByVulnerability(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse vulnerability param
	vulnerability, errStr := d.vulnerabilityFromParam(c.Params("vulnerability"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// get assessment from database
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

	// parse vulnerability param
	pocs, err := d.mongo.Poc().GetByVulnerabilityID(vulnerability.ID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get PoCs",
		})
	}

	if len(pocs) == 0 {
		pocs = []mongo.Poc{}
	}

	c.Status(fiber.StatusOK)
	return c.JSON(pocs)
}

func (d *Driver) pocFromParam(pocParam string) (*mongo.Poc, string) {
	if pocParam == "" {
		return nil, "PoC ID is required"
	}

	pocID, err := util.ParseUUID(pocParam)
	if err != nil {
		return nil, "Invalid PoC ID"
	}

	poc, err := d.mongo.Poc().GetByID(pocID)
	if err != nil {
		return nil, "Invalid PoC ID"
	}

	return poc, ""
}

func (d *Driver) validateData(data *pocRequestData) string {
	if !poc.IsValidType(data.Type) {
		return "Invalid PoC type"
	}

	return ""
}
