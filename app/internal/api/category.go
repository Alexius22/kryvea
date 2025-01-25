package api

import (
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
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
		ID                 string `json:"id"`
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

	var categoryID primitive.ObjectID
	if category.ID != "" {
		var err error
		categoryID, err = util.ParseMongoID(category.ID)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Invalid category ID",
			})
		}

		_, err = d.mongo.Category().GetByID(categoryID)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Invalid category ID",
			})
		}
	}

	if category.Index == "" || category.Name == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Index and Name are required",
		})
	}

	mongoCategory := &mongo.Category{
		Index:              category.Index,
		Name:               category.Name,
		GenericDescription: category.GenericDescription,
		GenericRemediation: category.GenericRemediation,
	}

	if categoryID != primitive.NilObjectID {
		err := d.mongo.Category().Update(categoryID, mongoCategory)
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

	err := d.mongo.Category().Insert(mongoCategory)
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

func (d *Driver) DeleteCategory(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	if !user.IsAdmin {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	categoryParam := c.Params("category")
	if categoryParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Category ID is required",
		})
	}

	categoryID, err := util.ParseMongoID(categoryParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid category ID",
		})
	}

	err = d.mongo.Category().Delete(categoryID)
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
