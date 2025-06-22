package api

import (
	"time"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
)

type userRequestData struct {
	DisabledAt     time.Time `json:"disabled_at"`
	Username       string    `json:"username"`
	Password       string    `json:"password"`
	PasswordExpiry time.Time `json:"password_expiry"`
	Role           string    `json:"role"`
	Customers      []string  `json:"customers"`
}

func (d *Driver) AddUser(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// check if user is admin
	if user.Role != mongo.ROLE_ADMIN {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	data := &userRequestData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	errStr := d.validateUserData(data)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// parse customer IDs
	customers := make([]mongo.UserCustomer, len(data.Customers))
	for i, customerID := range data.Customers {
		parsedCustomerID, err := util.ParseUUID(customerID)
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

		customers[i] = mongo.UserCustomer{ID: parsedCustomerID}
	}

	// insert user into database
	userID, err := d.mongo.User().Insert(&mongo.User{
		Username:  data.Username,
		Password:  data.Password,
		Role:      data.Role,
		Customers: customers,
	})
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot add user",
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message": "User added successfully",
		"user_id": userID,
	})
}

type loginRequestData struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (d *Driver) Login(c *fiber.Ctx) error {
	data := &loginRequestData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	if data.Username == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Username is required",
		})
	}

	if data.Password == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Password is required",
		})
	}

	// get session token from database
	token, expires, err := d.mongo.User().Login(data.Username, data.Password)
	if err != nil {
		if err == mongo.ErrDisabledUser {
			c.Status(fiber.StatusUnauthorized)
			return c.JSON(fiber.Map{
				"error": "User is disabled",
			})
		}

		if err == mongo.ErrPasswordExpired {
			resetToken, err := d.mongo.User().ForgotPassword(data.Username)
			if err != nil {
				c.Status(fiber.StatusInternalServerError)
				return c.JSON(fiber.Map{
					"error": "Password expired, cannot generate reset token",
				})
			}

			c.Status(fiber.StatusUnauthorized)
			return c.JSON(fiber.Map{
				"error":       "Password expired",
				"reset_token": resetToken,
			})
		}

		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	// set cookie with session token
	c.Cookie(&fiber.Cookie{
		Name:     "kryvea",
		Value:    token.String(),
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

	// check if user is admin
	if user.Role != mongo.ROLE_ADMIN {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// get all users from database
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

	// check if user is admin
	if user.Role != mongo.ROLE_ADMIN {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// parse user param
	user, errStr := d.userFromParam(c.Params("user"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(user)
}

func (d *Driver) UpdateUser(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// check if user is admin
	if user.Role != mongo.ROLE_ADMIN {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// parse user param
	oldUser, errStr := d.userFromParam(c.Params("user"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// parse request body
	data := &userRequestData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	errStr = d.validateUserData(data)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// parse customer IDs
	customers := make([]mongo.UserCustomer, len(data.Customers))
	for i, customerID := range data.Customers {
		parsedCustomerID, err := util.ParseUUID(customerID)
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

		customers[i] = mongo.UserCustomer{ID: parsedCustomerID}
	}

	// update user in database
	err := d.mongo.User().Update(oldUser.ID, &mongo.User{
		DisabledAt:     data.DisabledAt,
		Username:       data.Username,
		PasswordExpiry: data.PasswordExpiry,
		Role:           data.Role,
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

	// parse request body
	type reqData struct {
		Username    string    `json:"username"`
		Password    string    `json:"password"`
		Assessments []string  `json:"assessments"`
		DisabledAt  time.Time `json:"disabled_at"`
	}
	data := &reqData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	if data.Username == "" && data.Password == "" && len(data.Assessments) == 0 && data.DisabledAt.IsZero() {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "No data to update",
		})
	}

	// parse assessment IDs
	assessments := make([]mongo.UserAssessments, len(data.Assessments))
	for i, assessmentID := range data.Assessments {
		parsedAssessmentID, err := util.ParseUUID(assessmentID)
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

		assessments[i] = mongo.UserAssessments{ID: parsedAssessmentID}
	}

	// update user in database
	err := d.mongo.User().Update(user.ID, &mongo.User{
		Username:    data.Username,
		Password:    data.Password,
		Assessments: assessments,
		DisabledAt:  data.DisabledAt,
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

	// check if user is admin
	if user.Role != mongo.ROLE_ADMIN {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// parse user param
	userID, err := util.ParseUUID(c.Params("user"))
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// delete user from database
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

	// logout user from database
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

func (d *Driver) ResetPassword(c *fiber.Ctx) error {
	// parse request body
	type reqData struct {
		ResetToken string `json:"reset_token"`
		Password   string `json:"password"`
	}
	data := &reqData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	if data.ResetToken == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Reset token is required",
		})
	}

	if !util.IsValidPassword(data.Password) {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Password does not meet policy requirements",
		})
	}

	// reset password in database
	err := d.mongo.User().ResetPassword(data.ResetToken, data.Password)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot reset password",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "Password reset",
	})
}

func (d *Driver) userFromParam(userParam string) (*mongo.User, string) {
	if userParam == "" {
		return nil, "User ID is required"
	}

	userID, err := util.ParseUUID(userParam)
	if err != nil {
		return nil, "Invalid user ID"
	}

	user, err := d.mongo.User().Get(userID)
	if err != nil {
		return nil, "Invalid user ID"
	}

	return user, ""
}

func (d *Driver) validateUserData(data *userRequestData) string {
	if data.Username == "" {
		return "Username is required"
	}

	if data.Role != "" && !util.IsValidRole(data.Role) {
		return "Invalid role"
	}

	if data.Password != "" {
		if !util.IsValidPassword(data.Password) {
			return "Password does not meet policy requirements"
		}
	}

	return ""
}
