package api

import (
	"strings"
	"time"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
)

func (d *Driver) SessionMiddleware(c *fiber.Ctx) error {
	if (c.Path() == "/api/login" || c.Path() == "/api/password/reset") && c.Method() == fiber.MethodPost {
		return c.Next()
	}

	session := c.Cookies("kryvea")
	token, err := util.ParseUUID(session)
	if err != nil {
		util.ClearCookies(c)
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	user, err := d.mongo.User().GetByToken(token)
	if err != nil || user.TokenExpiry.Before(time.Now()) || (!user.DisabledAt.IsZero() && user.DisabledAt.Before(time.Now())) {
		util.ClearCookies(c)
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	if time.Until(user.TokenExpiry) < mongo.TOKEN_REFRESH_THRESHOLD {
		newToken, expires, err := d.mongo.User().RefreshUserToken(user)
		if err != nil {
			c.Status(fiber.StatusInternalServerError)
			return c.JSON(fiber.Map{
				"error": "Failed to refresh session",
			})
		}
		util.SetSessionCookie(c, newToken, expires)
	}

	c.Locals("user", user)

	return c.Next()
}

func (d *Driver) ContentTypeMiddleware(c *fiber.Ctx) error {
	if strings.Contains(c.Path(), "/upload/") && c.Method() == fiber.MethodPost {
		if !strings.HasPrefix(c.Get("Content-Type"), "multipart/form-data") {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Content-Type must be multipart/form-data",
			})
		}
		return c.Next()
	}

	if (c.Method() == fiber.MethodPost || c.Method() == fiber.MethodPatch) && c.Request().Header.ContentLength() > 0 {
		if c.Get("Content-Type") != "application/json" {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Content-Type must be application/json",
			})
		}
	}

	return c.Next()
}
