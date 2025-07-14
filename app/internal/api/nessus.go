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
	"github.com/google/uuid"
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

	assessmentID, err := util.ParseUUID(assessmentParam)
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
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message": "Nessus parsed",
	})
}

func (d *Driver) parse(data []byte, customer mongo.Customer, assessment mongo.Assessment, userID uuid.UUID) (err error) {
	nessusData, err := nessus.Parse(data)
	if err != nil {
		return err
	}

	var vulnerabilities []uuid.UUID
	var categories []uuid.UUID
	var targets []uuid.UUID

	defer func() {
		if err != nil {
			for _, vulnerabilityID := range vulnerabilities {
				cErr := d.mongo.Vulnerability().Delete(vulnerabilityID)
				if cErr != nil {
					err = fmt.Errorf("failed to cleanup: %v. Original error: %w", cErr, err)
				}
			}
			for _, categoryID := range categories {
				cErr := d.mongo.Category().Delete(categoryID)
				if cErr != nil {
					err = fmt.Errorf("failed to cleanup: %v. Original error: %w", cErr, err)
				}
			}
			for _, targetID := range targets {
				cErr := d.mongo.Target().Delete(targetID)
				if cErr != nil {
					err = fmt.Errorf("failed to cleanup: %v. Original error: %w", cErr, err)
				}
			}
		}
	}()

	for _, host := range nessusData.Report.ReportHosts {
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
			IPv4: hostIP,
			FQDN: hostFQDN,
			Name: "nessus",
		}

		targetID, isNew, err := d.mongo.Target().FirstOrInsert(target, customer.ID)
		if err != nil {
			return err
		}
		if isNew {
			targets = append(targets, targetID)
		}

		for _, item := range host.ReportItems {
			poc := mongo.Poc{
				Pocs: make([]mongo.PocItem, 0, 1),
			}
			category := &mongo.Category{
				Index: item.PluginID,
				Name:  item.PluginName,
				GenericDescription: map[string]string{
					"en": item.Description,
				},
				GenericRemediation: map[string]string{
					"en": item.Solution,
				},
				References: []string{},
				Source:     mongo.SOURCE_NESSUS,
			}

			categoryID, isNew, err := d.mongo.Category().FirstOrInsert(category)
			if err != nil {
				return err
			}
			if isNew {
				categories = append(categories, categoryID)
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
				Target: mongo.Target{
					Model: mongo.Model{ID: targetID},
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

			vulnerabilities = append(vulnerabilities, vulnerabilityID)

			poc.Pocs = append(poc.Pocs, mongo.PocItem{
				Index:    0,
				Type:     "text",
				TextData: item.PluginOutput,
			})
			poc.VulnerabilityID = vulnerabilityID

			err = d.mongo.Poc().Upsert(&poc)
			if err != nil {
				return err
			}
		}
	}

	return nil
}
