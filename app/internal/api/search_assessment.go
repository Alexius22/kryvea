package api

// func SearchAssessment(c *fiber.Ctx) error {
// 	type reqData struct {
// 		Name string `json:"name"`
// 	}

// 	data := &reqData{}
// 	if err := c.BodyParser(data); err != nil {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": "Cannot parse JSON",
// 		})
// 	}

// 	if data.Name == "" {
// 		c.Status(fiber.StatusBadRequest)
// 		return c.JSON(fiber.Map{
// 			"error": "Assessment Name is required",
// 		})
// 	}

// 	assessments, err := db.GetAssessmentsByName(data.Name)
// 	if err != nil {
// 		c.Status(fiber.StatusInternalServerError)
// 		return c.JSON(fiber.Map{
// 			"error": "Failed to retrieve assessments",
// 		})
// 	}

// 	c.Status(fiber.StatusOK)
// 	return c.JSON(assessments)
// }
