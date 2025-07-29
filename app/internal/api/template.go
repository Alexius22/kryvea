package api

import (
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/bytedance/sonic"
	"github.com/gabriel-vasile/mimetype"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type templateRequestData struct {
	Name           string `json:"name"`
	Language       string `json:"language"`
	AssessmentType string `json:"assessment_type"`
	CustomerID     string `json:"customer_id"`
}

func (d *Driver) AddTemplate(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse request data
	data := templateRequestData{}
	err := sonic.Unmarshal([]byte(c.FormValue("data")), &data)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// if customer is specified check if user has access to it
	customerTemplate := mongo.Customer{}
	if data.CustomerID != "" {
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

		customerTemplate.Model = mongo.Model{
			ID: customer.ID,
		}
	}

	// validate request data
	errStr := d.validateTemplateData(&data)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// parse template data from form
	templateData, filename, err := util.FormDataReadFile(c, "template")
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot read template data",
		})
	}

	if len(templateData) == 0 {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Template data is empty",
		})
	}

	// check if the template mimetype is supported
	mimeType := mimetype.Detect(templateData)
	templateType, exists := mongo.SupportedTemplateMimeTypes[mimeType.String()]
	if !exists {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid template type",
		})
	}

	// insert file into the database
	fileID, err := d.mongo.FileReference().Insert(templateData, filename)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot upload template",
		})
	}

	// create a new template
	template := &mongo.Template{
		Name:           data.Name,
		Filename:       filename,
		Language:       data.Language,
		Type:           templateType,
		AssessmentType: data.AssessmentType,
		FileID:         fileID,
		Customer:       customerTemplate,
	}

	// insert the template into the database
	templateID, err := d.mongo.Template().Insert(template)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot create template",
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message":     "Template created",
		"template_id": templateID,
	})
}

func (d *Driver) GetTemplate(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// get template from param
	template, errStr := d.templateFromParam(c.Params("template"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// check if user has access to the template
	if template.Customer.ID != uuid.Nil && !util.CanAccessCustomer(user, template.Customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(template)
}

func (d *Driver) GetTemplates(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// get all templates
	templates, err := d.mongo.Template().GetAll()
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Failed to fetch templates",
		})
	}

	// filter templates by user access
	filteredTemplates := make([]mongo.Template, 0)
	for _, template := range templates {
		if template.Customer.ID == uuid.Nil || util.CanAccessCustomer(user, template.Customer.ID) {
			filteredTemplates = append(filteredTemplates, template)
		}
	}

	c.Status(fiber.StatusOK)
	return c.JSON(filteredTemplates)
}

func (d *Driver) validateTemplateData(data *templateRequestData) string {
	if data.Name == "" {
		return "Name is required"
	}

	if data.Language == "" {
		return "Language is required"
	}

	if data.AssessmentType == "" {
		return "Assessment type is required"
	}

	return ""
}

func (d *Driver) templateFromParam(param string) (*mongo.Template, string) {
	if param == "" {
		return nil, "Template ID is required"
	}

	templateID, err := util.ParseUUID(param)
	if err != nil {
		return nil, "Invalid customer ID"
	}

	template, err := d.mongo.Template().GetByID(templateID)
	if err != nil {
		return nil, "Invalid template ID"
	}

	return template, ""
}
