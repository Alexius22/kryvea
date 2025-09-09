package api

import (
	"bytes"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/gabriel-vasile/mimetype"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func (d *Driver) GetImage(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse image param
	imageRef, errStr := d.fileFromParam(c.Params("file"))
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

		if user.CanAccessCustomer(assessment.Customer.ID) {
			canAccess = true
			break
		}
	}
	if !canAccess {
		c.Status(fiber.StatusForbidden)
		return c.JSON(fiber.Map{
			"error": "Forbidden",
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

func (d *Driver) GetTemplateFile(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse image param
	fileRef, errStr := d.fileFromParam(c.Params("file"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	template, err := d.mongo.Template().GetByFileID(fileRef.ID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot retrieve template",
		})
	}

	if template.Customer.ID != uuid.Nil && !user.CanAccessCustomer(template.Customer.ID) {
		c.Status(fiber.StatusForbidden)
		return c.JSON(fiber.Map{
			"error": "Forbidden",
		})
	}

	fileData, _, err := d.mongo.FileReference().ReadByID(fileRef.ID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot retrieve file",
		})
	}

	c.Status(fiber.StatusOK)
	c.Set("Content-Type", mongo.SupportedTemplateMimeTypes[template.MimeType])
	c.Set("Content-Disposition", "attachment; filename="+template.Filename)
	return c.SendStream(bytes.NewReader(fileData))
}

func (d *Driver) fileFromParam(param string) (*mongo.FileReference, string) {
	if param == "" {
		return nil, "File ID is required"
	}

	fileID, err := uuid.Parse(param)
	if err != nil {
		return nil, "Invalid file ID"
	}

	file, err := d.mongo.FileReference().GetByID(fileID)
	if err != nil {
		return nil, "Invalid file ID"
	}

	return file, ""
}
