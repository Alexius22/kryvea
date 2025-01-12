package middleware

import "github.com/gofiber/fiber/v2"

func Api(c *fiber.Ctx) error {
	if c.Method() == fiber.MethodPost && c.Get("Content-Type") != "application/json" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Content-Type must be application/json",
		})
	}

	return c.Next()
}
