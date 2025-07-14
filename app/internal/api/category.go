package api

import (
	"encoding/json"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type categoryRequestData struct {
	// ID                 string            `json:"id"`
	Index              string            `json:"index"`
	Name               string            `json:"name"`
	GenericDescription map[string]string `json:"generic_description"`
	GenericRemediation map[string]string `json:"generic_remediation"`
	References         []string          `json:"references"`
	Source             string            `json:"source"`
}

func (d *Driver) AddCategory(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// check if user is admin
	if user.Role != mongo.ROLE_ADMIN {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// parse request body
	data := &categoryRequestData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	errStr := d.validateCategoryData(data)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// insert category into database
	categoryID, err := d.mongo.Category().Insert(&mongo.Category{
		Index:              data.Index,
		Name:               data.Name,
		GenericDescription: data.GenericDescription,
		GenericRemediation: data.GenericRemediation,
		References:         data.References,
		Source:             data.Source,
	})
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot create category",
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message":     "Category created",
		"category_id": categoryID,
	})
}

func (d *Driver) UpdateCategory(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// check if user is admin
	if user.Role != mongo.ROLE_ADMIN {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// parse category param
	category, errStr := d.categoryFromParam(c.Params("category"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// parse request body
	data := &categoryRequestData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	errStr = d.validateCategoryData(data)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// update category in database
	err := d.mongo.Category().Update(category.ID, &mongo.Category{
		Index:              data.Index,
		Name:               data.Name,
		GenericDescription: data.GenericDescription,
		GenericRemediation: data.GenericRemediation,
		References:         data.References,
		Source:             data.Source,
	})
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot update category",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "Category updated",
	})
}

func (d *Driver) DeleteCategory(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// check if user is admin
	if user.Role != mongo.ROLE_ADMIN {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// parse category param
	category, errStr := d.categoryFromParam(c.Params("category"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// delete category from database
	err := d.mongo.Category().Delete(category.ID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot delete category",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "Category deleted",
	})
}

func (d *Driver) SearchCategories(c *fiber.Ctx) error {
	query := c.Query("query")
	if query == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Query is required",
		})
	}

	categories, err := d.mongo.Category().Search(query)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot search categories",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(categories)
}

func (d *Driver) GetCategories(c *fiber.Ctx) error {
	categories, err := d.mongo.Category().GetAll()
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get categories",
		})
	}

	_, ok := c.Queries()["download"]
	if ok {
		c.Set("Content-Disposition", "attachment; filename=categories.json")
	}

	c.Status(fiber.StatusOK)
	return c.JSON(categories)
}

func (d *Driver) GetCategory(c *fiber.Ctx) error {
	// parse category param
	category, errStr := d.categoryFromParam(c.Params("category"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(category)
}

func (d *Driver) UploadCategories(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// check if user is admin
	if user.Role != mongo.ROLE_ADMIN {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// parse override parameter
	override := c.FormValue("override")

	// parse request body
	dataBytes, err := util.ParseFormFile(c, "categories")
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot parse categories file",
		})
	}

	var data []categoryRequestData
	err = json.Unmarshal(dataBytes, &data)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate each category data
	for _, categoryData := range data {
		errStr := d.validateCategoryData(&categoryData)
		if errStr != "" {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": errStr,
			})
		}
	}

	// insert each category into database
	categories := make([]uuid.UUID, 0, len(data))
	for _, categoryData := range data {
		category := &mongo.Category{
			Index:              categoryData.Index,
			Name:               categoryData.Name,
			GenericDescription: categoryData.GenericDescription,
			GenericRemediation: categoryData.GenericRemediation,
			References:         categoryData.References,
			Source:             categoryData.Source,
		}

		categoryID, err := d.mongo.Category().Upsert(category, override == "true")
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Cannot create category",
			})
		}
		categories = append(categories, categoryID)
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message":      "Categories created",
		"category_ids": categories,
	})
}

func (d *Driver) categoryFromParam(categoryParam string) (*mongo.Category, string) {
	if categoryParam == "" {
		return nil, "Category ID is required"
	}

	categoryID, err := util.ParseUUID(categoryParam)
	if err != nil {
		return nil, "Invalid category ID"
	}

	category, err := d.mongo.Category().GetByID(categoryID)
	if err != nil {
		return nil, "Invalid category ID"
	}

	return category, ""
}

func (d *Driver) validateCategoryData(category *categoryRequestData) string {
	if category.Index == "" {
		return "Index is required"
	}

	if category.Name == "" {
		return "Name is required"
	}

	if !util.IsValidSource(category.Source) {
		return "Invalid source"
	}

	return ""
}
