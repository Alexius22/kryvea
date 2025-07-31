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
	// parse request body
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

	// TODO: create function to update the customers only, to avoid the use of mongo.Model
	// parse customer IDs
	customers := make([]mongo.Customer, len(data.Customers))
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

		customers[i] = mongo.Customer{
			Model: mongo.Model{
				ID: parsedCustomerID,
			},
		}
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
	user, err := d.mongo.User().Login(data.Username, data.Password)
	if err != nil {
		if err == mongo.ErrDisabledUser {
			c.Status(fiber.StatusUnauthorized)
			return c.JSON(fiber.Map{
				"error": "User is disabled",
			})
		}

		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	if user.PasswordExpiry.Before(time.Now()) {
		util.SetKryveaCookie(c, user.Token.String(), user.TokenExpiry)
		util.SetKryveaShadowCookie(c, util.CookiePasswordExpired, user.TokenExpiry)

		c.Status(fiber.StatusForbidden)
		return c.JSON(fiber.Map{
			"error": "Password expired",
		})
	}

	c.Locals("user", user)
	util.SetSessionCookies(c, user.Token, user.TokenExpiry)

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "User logged in successfully",
	})
}

func (d *Driver) GetUsers(c *fiber.Ctx) error {
	// get all users from database
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

func (d *Driver) GetMe(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// get user from database
	userData, err := d.mongo.User().Get(user.ID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get user",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(userData)
}

func (d *Driver) GetUser(c *fiber.Ctx) error {
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
	// parse user param
	user, errStr := d.userFromParam(c.Params("user"))
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
	errStr = d.validateUserUpdateData(data)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// TODO: create function to update the customers only, to avoid the use of mongo.Model
	// parse customer IDs
	customers := make([]mongo.Customer, len(data.Customers))
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

		customers[i] = mongo.Customer{
			Model: mongo.Model{
				ID: parsedCustomerID,
			},
		}
	}

	// update user in database
	err := d.mongo.User().Update(user.ID, &mongo.User{
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

type updateMeData struct {
	Username        string   `json:"username"`
	CurrentPassword string   `json:"current_password"`
	NewPassword     string   `json:"new_password"`
	Assessments     []string `json:"assessments"`
}

func (d *Driver) UpdateMe(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse request body
	data := &updateMeData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	errStr := d.validateUpdateMeData(data, user)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// parse assessment IDs
	assessments := make([]mongo.UserAssessment, len(data.Assessments))
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

		if !util.CanAccessCustomer(user, assessment.Customer.ID) {
			c.Status(fiber.StatusUnauthorized)
			return c.JSON(fiber.Map{
				"error": "Unauthorized",
			})
		}

		assessments[i] = mongo.UserAssessment{ID: parsedAssessmentID}
	}

	// update user in database
	err := d.mongo.User().Update(user.ID, &mongo.User{
		Username:    data.Username,
		Password:    data.NewPassword,
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

func (d *Driver) UpdateOwnedAssessment(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse request body
	type reqData struct {
		Assessment string `json:"assessment"`
		IsOwned    bool   `json:"is_owned"`
	}
	data := &reqData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	assessment, errStr := d.assessmentFromParam(data.Assessment)
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	if !util.CanAccessCustomer(user, assessment.Customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// add assessment to user in database
	err := d.mongo.User().UpdateOwnedAssessment(user.ID, assessment.ID, data.IsOwned)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot edit owned assessment",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "Owned assessment updated",
	})
}

func (d *Driver) DeleteUser(c *fiber.Ctx) error {
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

	util.ClearCookies(c)

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "User logged out",
	})
}

func (d *Driver) ResetUserPassword(c *fiber.Ctx) error {
	// parse user param
	user, errStr := d.userFromParam(c.Params("user"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	newPassword, err := util.GenerateRandomPassword(20)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot generate new password",
		})
	}

	err = d.mongo.User().ResetUserPassword(user.ID, newPassword)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Password expired, cannot generate reset token",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message":  "Password reset successfully",
		"password": newPassword,
	})
}

func (d *Driver) ResetPassword(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse request body
	type reqData struct {
		Password string `json:"password"`
	}
	data := &reqData{}
	if err := c.BodyParser(data); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	if data.Password == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Password is required",
		})
	}

	if !util.IsValidPassword(data.Password) {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Password does not meet policy requirements",
		})
	}

	// reset password in database
	err := d.mongo.User().ResetPassword(user, data.Password)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot reset password",
		})
	}

	util.SetSessionCookies(c, user.Token, user.TokenExpiry)

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

	if !util.IsValidPassword(data.Password) {
		return "Password does not meet policy requirements"
	}

	return ""
}

func (d *Driver) validateUserUpdateData(data *userRequestData) string {
	if data.Username == "" {
		return "Username is required"
	}

	if data.Role != "" && !util.IsValidRole(data.Role) {
		return "Invalid role"
	}

	if data.Password != "" && !util.IsValidPassword(data.Password) {
		return "Password does not meet policy requirements"
	}

	return ""
}

func (d *Driver) validateUpdateMeData(data *updateMeData, user *mongo.User) string {
	if data.Username == "" && data.NewPassword == "" && data.Assessments == nil {
		return "No data to update"
	}

	if data.NewPassword != "" {
		if data.CurrentPassword == "" {
			return "Current password is required"
		}

		if data.NewPassword == data.CurrentPassword {
			return "New password cannot be the same as current password"
		}

		err := d.mongo.User().ValidatePassword(user.ID, data.CurrentPassword)
		if err != nil || !util.IsValidPassword(data.NewPassword) {
			return "Invalid passwords"
		}
	}

	return ""
}
