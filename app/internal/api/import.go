package api

import (
	"encoding/base64"
	"errors"
	"fmt"
	"strings"

	"github.com/Alexius22/kryvea/internal/burp"
	"github.com/Alexius22/kryvea/internal/cvss"
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/nessus"
	pocpkg "github.com/Alexius22/kryvea/internal/poc"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/bytedance/sonic"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type importRequestData struct {
	Source string `json:"source"`
}

func (d *Driver) ImportVulnerbilities(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

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

	if !user.CanAccessCustomer(assessment.Customer.ID) {
		c.Status(fiber.StatusForbidden)
		return c.JSON(fiber.Map{
			"error": "Forbidden",
		})
	}

	customer, err := d.mongo.Customer().GetByID(assessment.Customer.ID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get customer",
		})
	}

	// parse request body
	importData := &importRequestData{}
	err = sonic.Unmarshal([]byte(c.FormValue("import_data")), &importData)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	data, _, err := d.formDataReadFile(c, "file")
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot read file",
		})
	}

	var parseErr error
	switch importData.Source {
	case mongo.SourceBurp:
		parseErr = d.ParseBurp(data, *customer, *assessment, user.ID)
	case mongo.SourceNessus:
		parseErr = d.ParseNessus(data, *customer, *assessment, user.ID)
	default:
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Unsupported source",
		})
	}
	if parseErr != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": fmt.Sprintf("Cannot parse: %v", parseErr),
		})
	}

	c.Status(fiber.StatusCreated)
	return c.JSON(fiber.Map{
		"message": "File parsed",
	})
}

func (d *Driver) ParseBurp(data []byte, customer mongo.Customer, assessment mongo.Assessment, userID uuid.UUID) (err error) {
	burpData, err := burp.Parse(data)
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

	for _, issue := range burpData.Issues {
		target := &mongo.Target{
			IPv4: issue.Host.IP,
			FQDN: issue.Host.Name,
			Tag:  "burp",
		}
		targetID, isNew, err := d.mongo.Target().FirstOrInsert(target, customer.ID)
		if err != nil {
			return err
		}
		if isNew {
			targets = append(targets, targetID)
		}

		err = d.mongo.Assessment().UpdateTargets(assessment.ID, targetID)
		if err != nil {
			return err
		}

		category := &mongo.Category{
			Index:              issue.Type,
			Name:               issue.Name,
			GenericDescription: map[string]string{"en": issue.IssueBackground},
			GenericRemediation: map[string]string{"en": issue.RemediationBackground},
			References:         []string{},
			Source:             mongo.SourceBurp,
		}
		categoryID, isNew, err := d.mongo.Category().FirstOrInsert(category)
		if err != nil {
			return err
		}
		if isNew {
			categories = append(categories, categoryID)
		}

		vulnerability := &mongo.Vulnerability{
			Category: mongo.Category{
				Model: mongo.Model{
					ID: categoryID,
				},
			},
			CVSSv2:      cvss.Vector{Version: cvss.Cvss2},
			CVSSv3:      cvss.Vector{Version: cvss.Cvss3},
			CVSSv31:     cvss.Vector{Version: cvss.Cvss31},
			CVSSv4:      cvss.Vector{Version: cvss.Cvss4},
			Status:      mongo.VulnearbilityStatusOpen,
			References:  []string{issue.References},
			Description: issue.IssueDetail,
			Remediation: issue.RemediationDetail,
			Target: mongo.Target{
				Model: mongo.Model{ID: targetID},
			},
			Assessment: mongo.Assessment{
				Model: mongo.Model{
					ID: assessment.ID,
				},
			},
			User: mongo.User{
				Model: mongo.Model{
					ID: userID,
				},
			},
		}
		vulnerabilityID, err := d.mongo.Vulnerability().Insert(vulnerability)
		if err != nil {
			return err
		}

		vulnerabilities = append(vulnerabilities, vulnerabilityID)

		items := len(issue.RequestResponses) + len(issue.CollaboratorEvents) + len(issue.InfiltratorEvents)
		poc := mongo.Poc{
			VulnerabilityID: vulnerabilityID,
			Pocs:            make([]mongo.PocItem, 0, items),
		}
		i := 0
		for _, requestResponse := range issue.RequestResponses {
			var request, response []byte
			if requestResponse.Request != nil {
				request, err = base64.StdEncoding.DecodeString(requestResponse.Request.Base64)
				if err != nil {
					return fmt.Errorf("cannot decode request: %w", err)
				}
			}
			if requestResponse.Response != nil {
				response, err = base64.StdEncoding.DecodeString(requestResponse.Response.Base64)
				if err != nil {
					return fmt.Errorf("cannot decode response: %w", err)
				}
			}

			poc.Pocs = append(poc.Pocs, mongo.PocItem{
				Index:    i,
				Type:     pocpkg.PocTypeRequest,
				Request:  string(request),
				Response: string(response),
			})

			i++
		}
		for _, collaboratorEvent := range issue.CollaboratorEvents {
			var request, response []byte
			if collaboratorEvent.RequestResponse != nil {
				if collaboratorEvent.RequestResponse.Request != nil {
					request, err = base64.StdEncoding.DecodeString(collaboratorEvent.RequestResponse.Request.Base64)
					if err != nil {
						return fmt.Errorf("cannot decode request: %w", err)
					}
				}
				if collaboratorEvent.RequestResponse.Response != nil {
					response, err = base64.StdEncoding.DecodeString(collaboratorEvent.RequestResponse.Response.Base64)
					if err != nil {
						return fmt.Errorf("cannot decode response: %w", err)
					}
				}
			}

			poc.Pocs = append(poc.Pocs, mongo.PocItem{
				Index: i,
				Type:  pocpkg.PocTypeText,
				TextData: fmt.Sprintf(`Interaction Type: %s
Origin IP: %s
Time: %s
Lookup Type: %s
Lookup Host: %s`,
					collaboratorEvent.InteractionType,
					collaboratorEvent.OriginIP,
					collaboratorEvent.Time,
					collaboratorEvent.LookupType,
					collaboratorEvent.LookupHost,
				),
				Request:  string(request),
				Response: string(response),
			})

			i++
		}
		for _, infiltratorEvent := range issue.InfiltratorEvents {
			poc.Pocs = append(poc.Pocs, mongo.PocItem{
				Index: i,
				Type:  pocpkg.PocTypeText,
				TextData: fmt.Sprintf(`Parameter Name: %s
Platform: %s
Signature: %s
Stack Trace: %s
Parameter Value: %s`,
					infiltratorEvent.ParameterName,
					infiltratorEvent.Platform,
					infiltratorEvent.Signature,
					infiltratorEvent.StackTrace,
					infiltratorEvent.ParameterValue,
				),
			})

			i++
		}

		err = d.mongo.Poc().Upsert(&poc)
		if err != nil {
			return err
		}
	}

	return nil
}

func (d *Driver) ParseNessus(data []byte, customer mongo.Customer, assessment mongo.Assessment, userID uuid.UUID) (err error) {
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

	if nessusData.Report == nil {
		return errors.New("report data is empty")
	}

	for _, host := range nessusData.Report.ReportHosts {
		if host == nil {
			continue
		}
		var hostIP, hostFQDN, hostRDNS string
		if host.HostProperties == nil {
			continue
		}
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
			Tag:  "nessus",
		}

		targetID, isNew, err := d.mongo.Target().FirstOrInsert(target, customer.ID)
		if err != nil {
			return err
		}
		if isNew {
			targets = append(targets, targetID)
		}

		err = d.mongo.Assessment().UpdateTargets(assessment.ID, targetID)
		if err != nil {
			return err
		}

		for _, item := range host.ReportItems {
			if item == nil {
				continue
			}

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
				References: strings.Split(item.SeeAlso, "\n"),
				Source:     mongo.SourceNessus,
			}

			categoryID, isNew, err := d.mongo.Category().FirstOrInsert(category)
			if err != nil {
				return err
			}
			if isNew {
				categories = append(categories, categoryID)
			}

			vulnerability := &mongo.Vulnerability{
				Category: mongo.Category{
					Model: mongo.Model{
						ID: categoryID,
					},
				},
				CVSSv2:        cvss.Vector{Version: cvss.Cvss2},
				CVSSv3:        cvss.Vector{Version: cvss.Cvss3},
				CVSSv31:       cvss.Vector{Version: cvss.Cvss31},
				CVSSv4:        cvss.Vector{Version: cvss.Cvss4},
				DetailedTitle: "",
				Status:        mongo.VulnearbilityStatusOpen,
				References:    []string{},
				Description:   item.Synopsis,
				Remediation:   item.Solution,
				Target: mongo.Target{
					Model: mongo.Model{ID: targetID},
				},
				Assessment: mongo.Assessment{
					Model: mongo.Model{
						ID: assessment.ID,
					},
				},
				User: mongo.User{
					Model: mongo.Model{
						ID: userID,
					},
				},
			}

			if item.CvssVector == "" && item.Cvss3Vector == "" {
				vector2, err := cvss.ParseVector(cvss.InfoVector2, cvss.Cvss2)
				if err != nil {
					return err
				}
				vulnerability.CVSSv2 = *vector2

				vector31, err := cvss.ParseVector(cvss.InfoVector31, cvss.Cvss31)
				if err != nil {
					return err
				}
				vulnerability.CVSSv31 = *vector31
			}

			// Parse cvss2
			if item.CvssVector != "" {
				vector, err := cvss.ParseVector(item.CvssVector, cvss.Cvss2)
				if err != nil {
					return err
				}

				vulnerability.CVSSv2 = *vector
			}

			// Parse cvss3 as cvss31
			if item.Cvss3Vector != "" {
				vectorString := strings.Replace(item.Cvss3Vector, cvss.Cvss3, cvss.Cvss31, 1)
				vector, err := cvss.ParseVector(vectorString, cvss.Cvss31)
				if err != nil {
					return err
				}

				vulnerability.CVSSv31 = *vector
			}

			vulnerabilityID, err := d.mongo.Vulnerability().Insert(vulnerability)
			if err != nil {
				return err
			}

			vulnerabilities = append(vulnerabilities, vulnerabilityID)

			poc.Pocs = append(poc.Pocs, mongo.PocItem{
				Index:        0,
				Type:         "text",
				TextLanguage: "plaintext",
				TextData:     item.PluginOutput,
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
