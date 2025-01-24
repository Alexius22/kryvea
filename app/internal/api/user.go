package api

import (
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/gofiber/fiber/v2"
)

func (d *Driver) Register(c *fiber.Ctx) error {
	type reqData struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	user := &reqData{}
	if err := c.BodyParser(user); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if user.Username == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Username is required",
		})
	}

	if user.Password == "" || len(user.Password) < 10 {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Password must be at least 10 characters",
		})
	}

	err := d.mongo.User().Insert(&mongo.User{
		Username: user.Username,
		Password: user.Password,
	})
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot register user",
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message": "User registered successfully",
	})
}

func (d *Driver) Login(c *fiber.Ctx) error {
	type reqData struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	user := &reqData{}
	if err := c.BodyParser(user); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if user.Username == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Username is required",
		})
	}

	if user.Password == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Password is required",
		})
	}

	token, expires, err := d.mongo.User().Login(user.Username, user.Password)
	if err != nil {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "kryvea",
		Value:    token,
		Secure:   true,
		HTTPOnly: true,
		SameSite: "Strict",
		Expires:  expires,
	})

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "User logged in successfully",
	})
}

func (d *Driver) GetAllUsers(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	if !user.IsAdmin {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	users, err := d.mongo.User().GetAll()
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get users",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(users)
}
