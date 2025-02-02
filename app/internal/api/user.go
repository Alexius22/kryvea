package api

import (
	"time"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

	if user.Role != mongo.ROLE_ADMIN {
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

func (d *Driver) UpdateUser(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	if user.Role != mongo.ROLE_ADMIN {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	type reqData struct {
		DisabledAt     time.Time `json:"disabled_at"`
		Username       string    `json:"username"`
		PasswordExpiry time.Time `json:"password_expiry"`
		Role           string    `json:"role"`
		Customers      []string  `json:"customers"`
	}

	req := &reqData{}
	if err := c.BodyParser(req); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if util.IsValidRole(req.Role) {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid role",
		})
	}

	var customers []primitive.ObjectID
	for _, customer := range req.Customers {
		customerID, err := util.ParseMongoID(customer)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Invalid customer ID",
			})
		}
		customers = append(customers, customerID)
	}

	err := d.mongo.User().Update(user.ID, &mongo.User{
		DisabledAt:     req.DisabledAt,
		Username:       req.Username,
		PasswordExpiry: req.PasswordExpiry,
		Role:           req.Role,
		Customers:      customers,
	})
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot update user",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "User updated",
	})
}

func (d *Driver) DeleteUser(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	if user.Role != mongo.ROLE_ADMIN {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	userID, err := util.ParseMongoID(c.Params("user"))
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	err = d.mongo.User().Delete(userID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot delete user",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "User deleted",
	})
}
