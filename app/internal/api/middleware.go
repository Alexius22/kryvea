package api

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

func (d *Driver) Middleware(c *fiber.Ctx) error {
	if c.Path() != "/api/login" {
		session := c.Cookies("kryvea")
		if session == "" {
			c.Status(fiber.StatusUnauthorized)
			return c.JSON(fiber.Map{
				"error": "Unauthorized",
			})
		}

		user, err := d.mongo.User().GetByToken(session)

		if err != nil || user.TokenExpiry.Before(time.Now()) {
			c.Status(fiber.StatusUnauthorized)
			return c.JSON(fiber.Map{
				"error": "Unauthorized",
			})
		}
	}

	if c.Method() == fiber.MethodPost && c.Get("Content-Type") != "application/json" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Content-Type must be application/json",
		})
	}

	return c.Next()
}
