package api

import (
	"github.com/Alexius22/kryvea/internal/db"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func AddCategory(c *fiber.Ctx) error {
	type reqData struct {
		Index string `json:"index"`
		Year  int    `json:"year"`
		Name  string `json:"name"`
	}

	data := &reqData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if data.Index == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Index is required",
		})
	}

	if data.Year == 0 {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Year is required",
		})
	}

	if data.Name == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Name is required",
		})
	}

	err := db.AddCategory(db.Category{
		Model: db.Model{
			ID: uuid.New().String(),
		},
		Index: data.Index,
		Year:  data.Year,
		Name:  data.Name,
	})
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "Category added successfully",
	})
}
