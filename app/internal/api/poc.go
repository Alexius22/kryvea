package api

import (
	"encoding/json"
	"log"

	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/poc"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	mongoV2 "go.mongodb.org/mongo-driver/v2/mongo"
)

// type pocRequestData struct {
// 	VulnerabilityID string    `json:"vulnerability_id"`
// 	Pocs            []pocData `json:"pocs"`
// }

type pocData struct {
	Index          int    `json:"index"`
	Type           string `json:"type"`
	Description    string `json:"description"`
	URI            string `json:"uri"`
	Request        string `json:"request"`
	Response       string `json:"response"`
	ImageReference string `json:"image_reference"`
	ImageCaption   string `json:"image_caption"`
	TextLanguage   string `json:"text_language"`
	TextData       string `json:"text_data"`
}

// func (d *Driver) AddPocs(c *fiber.Ctx) error {
// 	user := c.Locals("user").(*mongo.User)

// 	// parse request body
// 	data := &pocRequestData{}
// 	if err := c.BodyParser(&data); err != nil {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": "Cannot parse JSON",
// 		})
// 	}

// 	// retrieve vulnerability from database
// 	vulnerability, errStr := d.vulnerabilityFromParam(data.VulnerabilityID)
// 	if errStr != "" {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": errStr,
// 		})
// 	}

// 	// get assessment from database
// 	assessment, err := d.mongo.Assessment().GetByID(vulnerability.Assessment.ID)
// 	if err != nil {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": "Invalid vulnerability",
// 		})
// 	}

// 	if !util.CanAccessCustomer(user, assessment.Customer.ID) {
// 		c.Status(fiber.StatusUnauthorized)
// 		return c.JSON(fiber.Map{
// 			"error": "Unauthorized",
// 		})
// 	}

// 	// validate data
// 	pocs := make([]*mongo.PocItem, len(data.Pocs))
// 	for i, pocData := range data.Pocs {
// 		errStr = d.validateData(&pocData)
// 		if errStr != "" {
// 			c.Status(fiber.StatusBadRequest)
// 			return c.JSON(fiber.Map{
// 				"error": errStr,
// 			})
// 		}

// 		// insert poc into the database
// 		pocs[i] = &mongo.PocItem{
// 			Index:        pocData.Index,
// 			Type:         pocData.Type,
// 			Description:  pocData.Description,
// 			URI:          pocData.URI,
// 			Request:      pocData.Request,
// 			Response:     pocData.Response,
// 			ImageData:    pocData.ImageData,
// 			ImageCaption: pocData.ImageCaption,
// 			TextLanguage: pocData.TextLanguage,
// 			TextData:     pocData.TextData,
// 		}
// 	}

// 	// insert pocs into the database
// 	pocIDs, err := d.mongo.Poc().InsertMany(pocs, vulnerability.ID)
// 	if err != nil {
// 		c.Status(fiber.StatusInternalServerError)
// 		return c.JSON(fiber.Map{
// 			"error": "Failed to create PoCs",
// 		})
// 	}

// 	c.Status(fiber.StatusCreated)
// 	return c.JSON(fiber.Map{
// 		"message": "PoC created",
// 		"poc_ids": pocIDs,
// 	})
// }

// func (d *Driver) UpdatePoc(c *fiber.Ctx) error {
// 	user := c.Locals("user").(*mongo.User)

// 	// parse poc param
// 	oldPoc, errStr := d.pocFromParam(c.Params("poc"))
// 	if errStr != "" {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": errStr,
// 		})
// 	}

// 	// retrieve vulnerability from database
// 	vulnerability, err := d.mongo.Vulnerability().GetByID(oldPoc.VulnerabilityID)
// 	if err != nil {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": "Invalid vulnerability",
// 		})
// 	}

// 	// get assessment from database
// 	assessment, err := d.mongo.Assessment().GetByID(vulnerability.Assessment.ID)
// 	if err != nil {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": "Invalid vulnerability",
// 		})
// 	}

// 	if !util.CanAccessCustomer(user, assessment.Customer.ID) {
// 		c.Status(fiber.StatusUnauthorized)
// 		return c.JSON(fiber.Map{
// 			"error": "Unauthorized",
// 		})
// 	}

// 	// parse request body
// 	data := &pocData{}
// 	if err := c.BodyParser(data); err != nil {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": "Cannot parse JSON",
// 		})
// 	}

// 	// validate data
// 	errStr = d.validateData(data)
// 	if errStr != "" {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": errStr,
// 		})
// 	}

// 	// parse image data and insert it into the database
// 	var imageID uuid.UUID
// 	if oldPoc.Type == poc.POC_TYPE_IMAGE && len(data.ImageData) > 0 {
// 		imageID, err = d.mongo.FileReference().Insert(data.ImageData)
// 		if err != nil {
// 			c.Status(fiber.StatusBadRequest)
// 			return c.JSON(fiber.Map{
// 				"error": "Cannot upload image",
// 			})
// 		}
// 	}

// 	// update poc in the database
// 	err = d.mongo.Poc().Update(oldPoc.ID, &mongo.PocItem{
// 		Index:        data.Index,
// 		Type:         data.Type,
// 		Description:  data.Description,
// 		URI:          data.URI,
// 		Request:      data.Request,
// 		Response:     data.Response,
// 		ImageID:      imageID,
// 		ImageCaption: data.ImageCaption,
// 		TextLanguage: data.TextLanguage,
// 		TextData:     data.TextData,
// 	})
// 	if err != nil {
// 		c.Status(fiber.StatusInternalServerError)
// 		return c.JSON(fiber.Map{
// 			"error": "Failed to update PoC",
// 		})
// 	}

// 	c.Status(fiber.StatusOK)
// 	return c.JSON(fiber.Map{
// 		"message": "PoC updated",
// 	})
// }

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
	if !util.CanAccessCustomer(user, assessment.Customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// parse request body
	pocsData := []pocData{}
	pocsStr := c.FormValue("pocs")
	err = json.Unmarshal([]byte(pocsStr), &pocsData)
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

	pocUpsert := &mongo.Poc{
		VulnerabilityID: vulnerability.ID,
		Pocs:            make([]mongo.PocItem, 0, len(pocsData)),
	}
	// parse image data and insert it into the database
	for _, pocData := range pocsData {
		imageID := uuid.UUID{}
		if pocData.Type == poc.POC_TYPE_IMAGE && pocData.ImageReference != "" {
			imageData, filename, err := util.FormDataReadFile(c, pocData.ImageReference)
			if err != nil {
				log.Printf("Failed to read image data for ImageReference '%s' : %v", pocData.ImageReference, err)
				c.Status(fiber.StatusBadRequest)
				return c.JSON(fiber.Map{
					"error": "Cannot read image data",
				})
			}

			imageID, err = d.mongo.FileReference().Insert(imageData, filename)
			if err != nil {
				c.Status(fiber.StatusBadRequest)
				return c.JSON(fiber.Map{
					"error": "Cannot upload image",
				})
			}
		}
		pocUpsert.Pocs = append(pocUpsert.Pocs, mongo.PocItem{
			Index:        pocData.Index,
			Type:         pocData.Type,
			Description:  pocData.Description,
			URI:          pocData.URI,
			Request:      pocData.Request,
			Response:     pocData.Response,
			ImageID:      imageID,
			ImageCaption: pocData.ImageCaption,
			TextLanguage: pocData.TextLanguage,
			TextData:     pocData.TextData,
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

// func (d *Driver) DeletePoc(c *fiber.Ctx) error {
// 	user := c.Locals("user").(*mongo.User)

// 	// parse poc param
// 	poc, errStr := d.pocFromParam(c.Params("poc"))
// 	if errStr != "" {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": errStr,
// 		})
// 	}

// 	// retrieve vulnerability from database
// 	vulnerability, err := d.mongo.Vulnerability().GetByID(poc.VulnerabilityID)
// 	if err != nil {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": "Invalid vulnerability",
// 		})
// 	}

// 	// get assessment from database
// 	assessment, err := d.mongo.Assessment().GetByID(vulnerability.Assessment.ID)
// 	if err != nil {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": "Invalid vulnerability",
// 		})
// 	}

// 	if !util.CanAccessCustomer(user, assessment.Customer.ID) {
// 		c.Status(fiber.StatusUnauthorized)
// 		return c.JSON(fiber.Map{
// 			"error": "Unauthorized",
// 		})
// 	}

// 	// delete poc from database
// 	err = d.mongo.Poc().Delete(poc.ID)
// 	if err != nil {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": "Cannot delete PoC",
// 		})
// 	}

// 	c.Status(fiber.StatusOK)
// 	return c.JSON(fiber.Map{
// 		"message": "PoC deleted",
// 	})
// }

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

	if !util.CanAccessCustomer(user, assessment.Customer.ID) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// parse vulnerability param
	poc, err := d.mongo.Poc().GetByVulnerabilityID(vulnerability.ID)
	if err != nil && err != mongoV2.ErrNoDocuments {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Cannot get PoCs",
		})
	}

	c.Status(fiber.StatusOK)
	return c.JSON(poc.Pocs)
}

// func (d *Driver) pocFromParam(pocParam string) (*mongo.PocItem, string) {
// 	if pocParam == "" {
// 		return nil, "PoC ID is required"
// 	}

// 	pocID, err := util.ParseUUID(pocParam)
// 	if err != nil {
// 		return nil, "Invalid PoC ID"
// 	}

// 	poc, err := d.mongo.Poc().GetByID(pocID)
// 	if err != nil {
// 		return nil, "Invalid PoC ID"
// 	}

// 	return poc, ""
// }

func (d *Driver) validateData(data *pocData) string {
	if !poc.IsValidType(data.Type) {
		return "Invalid PoC type"
	}

	return ""
}
