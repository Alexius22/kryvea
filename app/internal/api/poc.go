package api

import (
	"encoding/base64"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/poc"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func (d *Driver) AddPoc(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	type reqData struct {
		Index        int    `json:"index"`
		Type         string `json:"type"`
		Description  string `json:"description"`
		URI          string `json:"uri"`
		Request      string `json:"request"`
		Response     string `json:"response"`
		ImageData    string `json:"image_data"`
		ImageCaption string `json:"image_caption"`
		TextLanguage string `json:"text_language"`
		TextData     string `json:"text_data"`
	}

	pocData := &reqData{}
	if err := c.BodyParser(pocData); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

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

	if poc.IsValidType(pocData.Type) == false {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid type",
		})
	}

	var imageID bson.ObjectID
	if pocData.Type == poc.POC_TYPE_IMAGE && len(pocData.ImageData) != 0 {
		decodedImage, err := base64.StdEncoding.DecodeString(pocData.ImageData)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Cannot decode image",
			})
		}
		imageID, err = d.mongo.File().Insert(decodedImage)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Cannot upload image",
			})
		}
	}

	pocID, err := d.mongo.Poc().Insert(&mongo.Poc{
		Index:           pocData.Index,
		Type:            pocData.Type,
		Description:     pocData.Description,
		URI:             pocData.URI,
		Request:         pocData.Request,
		Response:        pocData.Response,
		ImageID:         imageID,
		ImageCaption:    pocData.ImageCaption,
		TextLanguage:    pocData.TextLanguage,
		TextData:        pocData.TextData,
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
		Index        int    `json:"index"`
		Description  string `json:"description"`
		URI          string `json:"uri"`
		Request      string `json:"request"`
		Response     string `json:"response"`
		ImageData    string `json:"image_data"`
		ImageCaption string `json:"image_caption"`
		TextLanguage string `json:"text_language"`
		TextData     string `json:"text_data"`
	}

	pocData := &reqData{}
	if err := c.BodyParser(pocData); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

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

	oldPoc, err := d.mongo.Poc().GetByVulnerabilityAndID(vulnerabilityID, pocID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid PoC ID",
		})
	}

	var imageID bson.ObjectID
	if oldPoc.Type == poc.POC_TYPE_IMAGE && len(pocData.ImageData) != 0 {
		decodedImage, err := base64.StdEncoding.DecodeString(pocData.ImageData)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Cannot decode image",
			})
		}
		imageID, err = d.mongo.File().Insert(decodedImage)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Cannot upload image",
			})
		}
	}

	err = d.mongo.Poc().Update(pocID, &mongo.Poc{
		Index:        pocData.Index,
		Description:  pocData.Description,
		URI:          pocData.URI,
		Request:      pocData.Request,
		Response:     pocData.Response,
		ImageID:      imageID,
		ImageCaption: pocData.ImageCaption,
		TextLanguage: pocData.TextLanguage,
		TextData:     pocData.TextData,
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

	_, err = d.mongo.Poc().GetByVulnerabilityAndID(vulnerabilityID, pocID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid PoC ID",
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

func (d *Driver) GetPocsByVulnerability(c *fiber.Ctx) error {
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
			"err":   err.Error(),
		})
	}

	if len(pocs) == 0 {
		pocs = []mongo.Poc{}
	}

	c.Status(fiber.StatusOK)
	return c.JSON(pocs)
}
