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
	Name     string `json:"name"`
	Language string `json:"language"`
	Type     string `json:"type"`
}

func (d *Driver) addTemplate(c *fiber.Ctx) (*mongo.Template, string) {
	// parse request data
	data := templateRequestData{}
	err := sonic.Unmarshal([]byte(c.FormValue("data")), &data)
	if err != nil {
		return nil, "Cannot parse JSON"
	}

	// validate request data
	errStr := d.validateTemplateData(&data)
	if errStr != "" {
		return nil, errStr
	}

	// parse template data from form
	templateData, filename, err := util.FormDataReadFile(c, "template")
	if err != nil {
		return nil, "Cannot read template data"
	}

	if len(templateData) == 0 {
		return nil, "Template data is empty"
	}

	// check if the template mimetype is supported
	mimeType := mimetype.Detect(templateData)
	templateType, exists := mongo.SupportedTemplateMimeTypes[mimeType.String()]
	if !exists {
		return nil, "Invalid template type"
	}

	// insert file into the database
	fileID, err := d.mongo.FileReference().Insert(templateData, filename)
	if err != nil {
		return nil, "Cannot upload template"
	}

	// create a new template
	template := &mongo.Template{
		Name:     data.Name,
		Filename: filename,
		Language: data.Language,
		FileType: templateType,
		Type:     data.Type,
		FileID:   fileID,
		Customer: mongo.Customer{
			Model: mongo.Model{
				ID: uuid.Nil,
			},
		},
	}
	return template, ""
}

func (d *Driver) AddGlobalTemplate(c *fiber.Ctx) error {
	template, errStr := d.addTemplate(c)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
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

func (d *Driver) AddCustomerTemplate(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// if customer is specified check if user has access to it
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

	template, errStr := d.addTemplate(c)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	template.Customer.ID = customer.ID

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
	filteredTemplates := []mongo.Template{}
	for _, template := range templates {
		if template.Customer.ID == uuid.Nil || util.CanAccessCustomer(user, template.Customer.ID) {
			filteredTemplates = append(filteredTemplates, template)
		}
	}

	c.Status(fiber.StatusOK)
	return c.JSON(filteredTemplates)
}

func (d *Driver) DeleteTemplate(c *fiber.Ctx) error {
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
	if (template.Customer.ID == uuid.Nil && user.Role != mongo.RoleAdmin) ||
		(template.Customer.ID != uuid.Nil && !util.CanAccessCustomer(user, template.Customer.ID)) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// delete the template from the database
	err := d.mongo.Template().Delete(template.ID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Failed to delete template",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "Template deleted",
	})
}

func (d *Driver) validateTemplateData(data *templateRequestData) string {
	if data.Name == "" {
		return "Name is required"
	}

	if data.Language == "" {
		return "Language is required"
	}

	return ""
}

func (d *Driver) templateFromParam(param string) (*mongo.Template, string) {
	if param == "" {
		return nil, "Template ID is required"
	}

	templateID, err := util.ParseUUID(param)
	if err != nil {
		return nil, "Invalid template ID"
	}

	template, err := d.mongo.Template().GetByID(templateID)
	if err != nil {
		return nil, "Invalid template ID"
	}

	return template, ""
}
