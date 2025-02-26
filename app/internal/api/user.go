package api

import (
	"time"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
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

	userID, err := d.mongo.User().Insert(&mongo.User{
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
		"user_id": userID.Hex(),
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

func (d *Driver) GetUsers(c *fiber.Ctx) error {
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

	if len(users) == 0 {
		users = []mongo.User{}
	}

	c.Status(fiber.StatusOK)
	return c.JSON(users)
}

func (d *Driver) GetUser(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	if user.Role != mongo.ROLE_ADMIN {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	userParam := c.Params("user")
	if userParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "User ID is required",
		})
	}

	userID, err := util.ParseMongoID(userParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	user, err = d.mongo.User().Get(userID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get user",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(user)
}

func (d *Driver) UpdateUser(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	if user.Role != mongo.ROLE_ADMIN {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	userParam := c.Params("user")
	if userParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "User ID is required",
		})
	}

	userID, err := util.ParseMongoID(userParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid user ID",
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

	var customers []mongo.UserCustomer
	for _, customerID := range req.Customers {
		parsedCustomerID, err := util.ParseMongoID(customerID)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Invalid customer ID",
			})
		}

		_, err = d.mongo.Customer().GetByID(parsedCustomerID)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Invalid customer ID",
			})
		}

		customers = append(customers, mongo.UserCustomer{ID: parsedCustomerID})
	}

	err = d.mongo.User().Update(userID, &mongo.User{
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

func (d *Driver) UpdateMe(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	type reqData struct {
		Username    string   `json:"username"`
		Password    string   `json:"password"`
		Assessments []string `json:"assessments"`
	}

	req := &reqData{}
	if err := c.BodyParser(req); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if req.Username == "" && req.Password == "" && len(req.Assessments) == 0 {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "No data to update",
		})
	}

	var assessments []mongo.UserAssessments
	for _, assessmentID := range req.Assessments {
		parsedAssessmentID, err := util.ParseMongoID(assessmentID)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Invalid assessment ID",
			})
		}

		assessment, err := d.mongo.Assessment().GetByID(parsedAssessmentID)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Invalid assessment ID",
			})
		}

		if user.Role != mongo.ROLE_ADMIN && !util.CanAccessCustomer(user, assessment.Customer.ID) {
			c.Status(fiber.StatusUnauthorized)
			return c.JSON(fiber.Map{
				"error": "Unauthorized",
			})
		}

		assessments = append(assessments, mongo.UserAssessments{ID: parsedAssessmentID})
	}

	err := d.mongo.User().Update(user.ID, &mongo.User{
		Username:    req.Username,
		Password:    req.Password,
		Assessments: assessments,
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

func (d *Driver) Logout(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	err := d.mongo.User().Logout(user.ID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot logout user",
		})
	}

	c.ClearCookie("kryvea")

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "User logged out",
	})
}

func (d *Driver) ForgotPassword(c *fiber.Ctx) error {
	type reqData struct {
		Username string `json:"username"`
	}

	req := &reqData{}
	if err := c.BodyParser(req); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if req.Username == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Username is required",
		})
	}

	go d.mongo.User().ForgotPassword(req.Username)

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "Reset token generated",
	})
}

func (d *Driver) ResetPassword(c *fiber.Ctx) error {
	type reqData struct {
		ResetToken      string `json:"reset_token"`
		Password        string `json:"password"`
		ConfirmPassword string `json:"confirm_password"`
	}

	req := &reqData{}
	if err := c.BodyParser(req); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if req.ResetToken == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Reset token is required",
		})
	}

	if req.Password != req.ConfirmPassword {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Passwords do not match",
		})
	}

	// TODO: Make password complexity check as global
	if req.Password == "" || len(req.Password) < 10 {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Password must be at least 10 characters",
		})
	}

	err := d.mongo.User().ResetPassword(req.ResetToken, req.Password)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot reset password",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "Password reset",
	})
}
