package api

// func SearchTarget(c *fiber.Ctx) error {
// 	type reqData struct {
// 		Search string `json:"search"`
// 	}

// 	var data reqData
// 	if err := c.BodyParser(&data); err != nil {
// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
// 			"error": err.Error(),
// 		})
// 	}

// 	targets, err := db.SearchTarget(data.Search)
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
// 			"error": err.Error(),
// 		})
// 	}

// 	c.Status(fiber.StatusOK)
// 	return c.JSON(targets)
// }
