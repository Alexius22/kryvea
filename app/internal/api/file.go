package api

import (
	"bytes"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gabriel-vasile/mimetype"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func (d *Driver) GetFile(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse image param
	imageRef, errStr := d.imageFromParam(c.Params("file"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// retrieve vulnerability from database
	pocs, err := d.mongo.Poc().GetByImageID(imageRef.ID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot retrieve POCs",
		})
	}

	canAccess := false
	for _, poc := range pocs {
		vulnerability, err := d.mongo.Vulnerability().GetByID(poc.VulnerabilityID)
		if err != nil {
			c.Status(fiber.StatusInternalServerError)
			return c.JSON(fiber.Map{
				"error": "Cannot retrieve vulnerability",
			})
		}

		assessment, err := d.mongo.Assessment().GetByID(vulnerability.Assessment.ID)
		if err != nil {
			c.Status(fiber.StatusInternalServerError)
			return c.JSON(fiber.Map{
				"error": "Cannot retrieve assessment",
			})
		}

		if util.CanAccessCustomer(user, assessment.Customer.ID) {
			canAccess = true
			break
		}
	}
	if !canAccess {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	imageData, _, err := d.mongo.FileReference().ReadByID(imageRef.ID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot retrieve image",
		})
	}

	mimeType := mimetype.Detect(imageData)

	c.Status(fiber.StatusOK)
	c.Set("Content-Type", mimeType.String())
	return c.SendStream(bytes.NewReader(imageData))
}

func (d *Driver) imageFromParam(param string) (*mongo.FileReference, string) {
	if param == "" {
		return nil, "Image ID is required"
	}

	imageID, err := uuid.Parse(param)
	if err != nil {
		return nil, "Invalid image ID"
	}

	image, err := d.mongo.FileReference().GetByID(imageID)
	if err != nil {
		return nil, "Invalid image ID"
	}

	return image, ""
}
