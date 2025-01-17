package api

// func AddCategory(c *fiber.Ctx) error {
// 	type reqData struct {
// 		Index              string `json:"index"`
// 		Name               string `json:"name"`
// 		GenericDescription string `json:"generic_description"`
// 		GenericRemediation string `json:"generic_remediation"`
// 	}

// 	data := &reqData{}
// 	if err := c.BodyParser(data); err != nil {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": "Cannot parse JSON",
// 		})
// 	}

// 	if data.Index == "" {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": "Index is required",
// 		})
// 	}

// 	if data.Name == "" {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": "Name is required",
// 		})
// 	}

// 	err := db.AddCategory(db.Category{
// 		Model: db.Model{
// 			ID: uuid.New().String(),
// 		},
// 		Index:              data.Index,
// 		Name:               data.Name,
// 		GenericDescription: data.GenericDescription,
// 		GenericRemediation: data.GenericRemediation,
// 	})
// 	if err != nil {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": err.Error(),
// 		})
// 	}

// 	c.Status(fiber.StatusOK)
// 	return c.JSON(fiber.Map{
// 		"message": "Category added successfully",
// 	})
// }
