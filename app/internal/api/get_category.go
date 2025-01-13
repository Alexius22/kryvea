package api

import (
	"github.com/Alexius22/kryvea/internal/db"
	"github.com/gofiber/fiber/v2"
)

func GetAllCategories(c *fiber.Ctx) error {
	categories, err := db.GetAllCategories()
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get categories",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(categories)
}
