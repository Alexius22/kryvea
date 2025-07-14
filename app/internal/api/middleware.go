package api

import (
	"log"
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
		log.Println("Invalid session token:", err)
		util.ClearCookies(c)
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	mongoUser, err := d.mongo.User().GetByToken(token)
	if err != nil || mongoUser.TokenExpiry.Before(time.Now()) || (!mongoUser.DisabledAt.IsZero() && mongoUser.DisabledAt.Before(time.Now())) {
		log.Println("Invalid or expired session for user:", "Error:", err)
		util.ClearCookies(c)
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	if time.Until(mongoUser.TokenExpiry) < (mongo.TOKEN_EXPIRE_TIME/2)*time.Hour {
		newToken, expires, err := d.mongo.User().RefreshUserToken(mongoUser.ID)
		if err != nil {
			log.Println("Failed to refresh session for user:", mongoUser.ID, "Error:", err)
			c.Status(fiber.StatusInternalServerError)
			return c.JSON(fiber.Map{
				"error": "Failed to refresh session",
			})
		}
		util.SetSessionCookie(c, newToken, expires)
	}

	c.Locals("user", mongoUser)

	return c.Next()
}

func (d *Driver) ContentTypeMiddleware(c *fiber.Ctx) error {
	if strings.Contains(c.Path(), "/upload/") && c.Method() == fiber.MethodPost {
		if !strings.HasPrefix(c.Get("Content-Type"), "multipart/form-data") {
			log.Println("Invalid Content-Type for upload:", c.Get("Content-Type"))
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Content-Type must be multipart/form-data",
			})
		}
		return c.Next()
	}

	if (c.Method() == fiber.MethodPost || c.Method() == fiber.MethodPatch) && c.Request().Header.ContentLength() > 0 {
		if c.Get("Content-Type") != "application/json" {
			log.Println("Invalid Content-Type for JSON request:", c.Get("Content-Type"))
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Content-Type must be application/json",
			})
		}
	}

	return c.Next()
}
