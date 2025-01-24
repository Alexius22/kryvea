package api

import (
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/gofiber/fiber/v2"
)

func (d *Driver) AddCategory(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	if !user.IsAdmin {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	type reqData struct {
		Index              string `json:"index"`
		Name               string `json:"name"`
		GenericDescription string `json:"generic_description"`
		GenericRemediation string `json:"generic_remediation"`
	}
	category := &reqData{}
	if err := c.BodyParser(category); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if category.Index == "" || category.Name == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Index and Name are required",
		})
	}

	err := d.mongo.Category().Insert(&mongo.Category{
		Index:              category.Index,
		Name:               category.Name,
		GenericDescription: category.GenericDescription,
		GenericRemediation: category.GenericRemediation,
	})
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot create category",
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message": "Category created",
	})
}

func (d *Driver) SearchCategories(c *fiber.Ctx) error {
	query := c.Query("q")
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

func (d *Driver) GetAllCategories(c *fiber.Ctx) error {
	categories, err := d.mongo.Category().GetAll()
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get categories",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(categories)
}
