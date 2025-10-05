package api

import (
	"fmt"
	"log"
	"strings"
	"sync"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/poc"
	"github.com/bytedance/sonic"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// type pocRequestData struct {
// 	VulnerabilityID string    `json:"vulnerability_id"`
// 	Pocs            []pocData `json:"pocs"`
// }

type pocData struct {
	Index              int                     `json:"index"`
	Type               string                  `json:"type"`
	Description        string                  `json:"description"`
	URI                string                  `json:"uri"`
	Request            string                  `json:"request"`
	RequestHighlights  []mongo.HighlightedText `json:"request_highlights"`
	Response           string                  `json:"response"`
	ResponseHighlights []mongo.HighlightedText `json:"response_highlights"`
	ImageReference     string                  `json:"image_reference"`
	ImageCaption       string                  `json:"image_caption"`
	TextLanguage       string                  `json:"text_language"`
	TextData           string                  `json:"text_data"`
	TextHighlights     []mongo.HighlightedText `json:"text_highlights"`
}

func (d *Driver) UpsertPocs(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse vulnerability param
	vulnerability, errStr := d.vulnerabilityFromParam(c.Params("vulnerability"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// get assessment from database
	assessment, err := d.mongo.Assessment().GetByID(vulnerability.Assessment.ID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid vulnerability",
		})
	}

	// check if user can access the customer
	if !user.CanAccessCustomer(assessment.Customer.ID) {
		c.Status(fiber.StatusForbidden)
		return c.JSON(fiber.Map{
			"error": "Forbidden",
		})
	}

	// parse request body
	pocsData := []pocData{}
	pocsStr := c.FormValue("pocs")
	err = sonic.Unmarshal([]byte(pocsStr), &pocsData)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// validate data
	for _, pocData := range pocsData {
		errStr = d.validateData(&pocData)
		if errStr != "" {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(fiber.Map{
				"error": errStr,
			})
		}
	}

	wg := sync.WaitGroup{}
	imageValidationError := ""
	// parse image data and insert it into the database
	for _, pocData := range pocsData {
		if pocData.Type != poc.PocTypeImage {
			continue
		}

		wg.Add(1)
		go func(imageReference string) {
			defer wg.Done()

			file, err := c.FormFile(imageReference)
			if err != nil {
				imageValidationError = fmt.Sprintf("Cannot get image file for reference %s", imageReference)
				log.Println(err)
				return
			}

			imageData, err := d.readFile(file)
			if err != nil {
				imageValidationError = fmt.Sprintf("Cannot read image file for reference %s", imageReference)
				log.Println(err)
				return
			}

			if !mongo.IsImageTypeAllowed(imageData) {
				imageValidationError = fmt.Sprintf("Image type not allowed for reference %s", imageReference)
				log.Println(err)
				return
			}

			if !poc.IsValidPNG(imageData) && !poc.IsValidJPEG(imageData) {
				imageValidationError = fmt.Sprintf("Invalid image file for reference %s", imageReference)
				log.Println(err)
				return
			}
		}(pocData.ImageReference)
	}
	wg.Wait()

	if imageValidationError != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": imageValidationError,
		})
	}

	pocUpsert := &mongo.Poc{
		VulnerabilityID: vulnerability.ID,
		Pocs:            make([]mongo.PocItem, 0, len(pocsData)),
	}
	for _, pocData := range pocsData {
		imageID := uuid.UUID{}
		pocImageFilename := ""
		if pocData.Type == poc.PocTypeImage {
			imageData, filename, err := d.formDataReadImage(c, pocData.ImageReference)
			if err != nil {
				c.Status(fiber.StatusBadRequest)

				switch err {
				case mongo.ErrFileSizeTooLarge:
					return c.JSON(fiber.Map{
						"error": "Image file size is too large",
					})
				case mongo.ErrImageTypeNotAllowed:
					return c.JSON(fiber.Map{
						"error": "Image type is not allowed",
					})
				}

				return c.JSON(fiber.Map{
					"error": "Cannot read image data",
				})
			}

			pocImageFilename = filename

			// TODO: FileReference should also be updated with the pocItem ID
			// or the poc upsert logic should be reworked
			// (Jack) TODO: can we do this with goroutines to fasten the process?
			imageID, err = d.mongo.FileReference().Insert(imageData, filename)
			if err != nil {
				c.Status(fiber.StatusBadRequest)
				return c.JSON(fiber.Map{
					"error": "Cannot upload image",
				})
			}
		}

		pocUpsert.Pocs = append(pocUpsert.Pocs, mongo.PocItem{
			Index:              pocData.Index,
			Type:               pocData.Type,
			Description:        pocData.Description,
			URI:                pocData.URI,
			Request:            pocData.Request,
			RequestHighlights:  pocData.RequestHighlights,
			Response:           pocData.Response,
			ResponseHighlights: pocData.ResponseHighlights,
			ImageID:            imageID,
			ImageFilename:      pocImageFilename,
			ImageCaption:       pocData.ImageCaption,
			TextLanguage:       pocData.TextLanguage,
			TextData:           pocData.TextData,
			TextHighlights:     pocData.TextHighlights,
		})
	}

	// update poc in the database
	err = d.mongo.Poc().Upsert(pocUpsert)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Failed to update PoC",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(fiber.Map{
		"message": "PoCs updated",
	})
}

func (d *Driver) GetPocsByVulnerability(c *fiber.Ctx) error {
	user := c.Locals("user").(*mongo.User)

	// parse vulnerability param
	vulnerability, errStr := d.vulnerabilityFromParam(c.Params("vulnerability"))
	if errStr != "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": errStr,
		})
	}

	// get assessment from database
	assessment, err := d.mongo.Assessment().GetByID(vulnerability.Assessment.ID)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid vulnerability",
		})
	}

	if !user.CanAccessCustomer(assessment.Customer.ID) {
		c.Status(fiber.StatusForbidden)
		return c.JSON(fiber.Map{
			"error": "Forbidden",
		})
	}

	// parse vulnerability param
	poc, err := d.mongo.Poc().GetByVulnerabilityID(vulnerability.ID)
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get PoCs",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(poc.Pocs)
}

func (d *Driver) validateData(data *pocData) string {
	if !poc.IsValidType(data.Type) {
		return "Invalid PoC type"
	}

	switch data.Type {
	case poc.PocTypeText:
		if strings.TrimSpace(data.TextData) == "" {
			return "Text data cannot be empty"
		}
	case poc.PocTypeRequest:
		if strings.TrimSpace(data.Request) == "" && strings.TrimSpace(data.Response) == "" {
			return "Request and Response cannot be both empty"
		}
	case poc.PocTypeImage:
		if strings.TrimSpace(data.ImageReference) == "" {
			return "Image reference cannot be empty"
		}
		// TODO: Handle images with same filename
	default:
		return "Invalid PoC type"
	}

	return ""
}
