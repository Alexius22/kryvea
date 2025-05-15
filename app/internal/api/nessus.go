package api

import (
	"fmt"
	"io"
	"strings"

	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/nessus"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func (d *Driver) UploadNessus(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	fileHeader, err := c.FormFile("xml")
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse XML",
		})
	}

	assessmentParam := c.Params("assessment")
	if assessmentParam == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Assessment ID is required",
		})
	}

	assessmentID, err := util.ParseMongoID(assessmentParam)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid assessment ID",
		})
	}

	assessment, err := d.mongo.Assessment().GetByID(assessmentID)
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

	customer, err := d.mongo.Customer().GetByID(assessment.Customer.ID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get customer",
		})
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Failed to open file",
		})
	}

	data, err := io.ReadAll(file)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Failed to read file",
		})
	}

	err = d.parse(data, *customer, *assessment, user.ID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse Nessus",
			// TODO: remove
			"err": err.Error(),
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message": "Nessus parsed",
	})
}

func (d *Driver) parse(data []byte, customer mongo.Customer, assessment mongo.Assessment, userID bson.ObjectID) error {
	nessusData, err := nessus.Parse(data)
	if err != nil {
		return err
	}

	// TODO: clean up if an upload fails
	for _, host := range nessusData.Report.ReportHosts {
		// target
		var hostIP, hostFQDN, hostRDNS string
		for _, property := range host.HostProperties.Tag {
			switch property.Name {
			case "host-ip":
				hostIP = property.Text
			case "host-fqdn":
				hostFQDN = property.Text
			case "host-rdns":
				hostRDNS = property.Text
			}
		}
		if hostFQDN == hostRDNS {
			hostFQDN = ""
		}

		target := &mongo.Target{
			IP:       hostIP,
			Hostname: hostFQDN,
			Customer: mongo.TargetCustomer{
				ID: customer.ID,
			},
		}

		targetIDs, err := d.mongo.Target().Search(customer.ID, target.IP)
		if err != nil {
			return err
		}
		var targetID bson.ObjectID
		if len(targetIDs) == 0 {
			targetID, err = d.mongo.Target().Insert(target)
			if err != nil {
				return err
			}
		}
		if len(targetIDs) > 0 {
			targetID = targetIDs[0].ID
		}

		fmt.Printf("ip: %s, fqdn: %s\n", hostIP, hostFQDN)

		for _, item := range host.ReportItems {
			category := &mongo.Category{
				Index: item.PluginID,
				Name:  item.PluginName,
				GenericDescription: map[string]string{
					"en": item.Description,
				},
				GenericRemediation: map[string]string{
					"en": item.Solution,
				},
			}

			categoryIDs, err := d.mongo.Category().Search(category.Name)
			if err != nil {
				return err
			}
			var categoryID bson.ObjectID
			if len(categoryIDs) == 0 {
				categoryID, err = d.mongo.Category().Insert(category)
				if err != nil {
					return err
				}
			}
			if len(categoryIDs) > 0 {
				categoryID = categoryIDs[0].ID
			}

			vulnerability := &mongo.Vulnerability{
				Category: mongo.VulnerabilityCategory{
					ID: categoryID,
				},
				CVSSv2:        mongo.VulnerabilityCVSS{},
				CVSSv3:        mongo.VulnerabilityCVSS{},
				CVSSv31:       mongo.VulnerabilityCVSS{},
				CVSSv4:        mongo.VulnerabilityCVSS{},
				DetailedTitle: "",
				References:    strings.Split(item.SeeAlso, "\n"),
				Description:   item.Synopsis,
				Remediation:   item.Solution,
				Target: mongo.VulnerabilityTarget{
					ID: targetID,
				},
				Assessment: mongo.VulnerabilityAssessment{
					ID: assessment.ID,
				},
				User: mongo.VulnerabilityUser{
					ID: userID,
				},
			}

			if item.CvssVector != "" {
				vectorParts := strings.Split(item.CvssVector, "CVSS2#")
				vector := item.CvssVector
				if len(vectorParts) > 1 {
					vector = vectorParts[1]
				}
				cvssScore, cvssSeverity, err := cvss.ParseVector(vector, cvss.CVSS2)
				if err != nil {
					return err
				}
				vulnerability.CVSSv2.CVSSVector = vector
				vulnerability.CVSSv2.CVSSScore = cvssScore
				vulnerability.CVSSv2.CVSSSeverity = cvssSeverity
				vulnerability.CVSSv2.CVSSDescription = cvss.GenerateDescription(vector, cvss.CVSS2, customer.Language)
			}

			if item.Cvss3Vector != "" {
				cvssScore, cvssSeverity, err := cvss.ParseVector(item.Cvss3Vector, cvss.CVSS3)
				if err != nil {
					return err
				}
				vulnerability.CVSSv3.CVSSVector = item.Cvss3Vector
				vulnerability.CVSSv3.CVSSScore = cvssScore
				vulnerability.CVSSv3.CVSSSeverity = cvssSeverity
				vulnerability.CVSSv3.CVSSDescription = cvss.GenerateDescription(item.Cvss3Vector, cvss.CVSS3, customer.Language)
			}

			vulnerabilityID, err := d.mongo.Vulnerability().Insert(vulnerability)
			if err != nil {
				return err
			}

			poc := &mongo.Poc{
				Index:           0,
				Type:            "text",
				TextData:        item.PluginOutput,
				VulnerabilityID: vulnerabilityID,
			}

			// insert poc
			_, err = d.mongo.Poc().Insert(poc)
			if err != nil {
				return err
			}
		}
	}

	return nil
}
