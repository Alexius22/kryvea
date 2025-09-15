package util

import (
	"io"

	"github.com/gofiber/fiber/v2"
)

func ParseFormFile(c *fiber.Ctx, param string) ([]byte, error) {
	if param == "" {
		return nil, nil
	}

	fileHeader, err := c.FormFile(param)
	if err != nil {
		return nil, err
	}

	file, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}

	return data, nil
}
