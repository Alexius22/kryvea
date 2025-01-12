package api

import (
	"net"

	"github.com/Alexius22/kryvea/internal/db"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func AddTarget(c *fiber.Ctx) error {
	type reqData struct {
		IP           string `json:"ip"`
		Port         int    `json:"port"`
		Protocol     string `json:"protocol"`
		Hostname     string `json:"hostname"`
		AssessmentID string `json:"assessment_id"`
		CustomerID   string `json:"customer_id"`
	}

	target := &reqData{}
	if err := c.BodyParser(target); err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// Validate fields
	if target.IP == "" || target.CustomerID == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "IP and Customer ID are required",
		})
	}

	if net.ParseIP(target.IP) == nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid IP address",
		})
	}

	if target.Port < 0 || target.Port > 65535 {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid port number",
		})
	}

	if target.Protocol != "" && (target.Protocol != "tcp" && target.Protocol != "udp") {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid protocol",
		})
	}

	_, err := db.GetCustomerByID(target.CustomerID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid customer ID",
		})
	}

	newTarget := db.Target{
		Model: db.Model{
			ID: uuid.New().String(),
		},
		IP:         target.IP,
		Port:       target.Port,
		Protocol:   target.Protocol,
		Hostname:   target.Hostname,
		CustomerID: target.CustomerID,
	}

	err = db.AddTarget(newTarget)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot create target",
		})
	}

	if target.AssessmentID != "" {
		_, err := db.GetAssessmentByID(target.AssessmentID)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Invalid assessment ID",
			})
		}

		err = db.AddTargetToAssessment(newTarget.ID, target.AssessmentID)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": "Cannot add target to assessment",
			})
		}
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message": "Target created",
	})
}
