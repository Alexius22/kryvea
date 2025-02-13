package api

import (
	"time"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/gofiber/fiber/v2"
)

func (d *Driver) Middleware(c *fiber.Ctx) error {
	var user *mongo.User
	if c.Path() != "/api/login" && c.Path() != "/api/register" {
		session := c.Cookies("kryvea")
		if session == "" {
			c.Status(fiber.StatusUnauthorized)
			return c.JSON(fiber.Map{
				"error": "Unauthorized",
			})
		}

		var err error
		user, err = d.mongo.User().GetByToken(session)
		if err != nil || user.TokenExpiry.Before(time.Now()) || (!user.DisabledAt.IsZero() && user.DisabledAt.Before(time.Now())) {
			c.Status(fiber.StatusUnauthorized)
			return c.JSON(fiber.Map{
				"error": "Unauthorized",
			})
		}
	}

	c.Locals("user", user)

	if c.Method() == fiber.MethodPost && c.Get("Content-Type") != "application/json" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Content-Type must be application/json",
		})
	}

	return c.Next()
}
