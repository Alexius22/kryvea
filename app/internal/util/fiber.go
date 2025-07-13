package util

import (
	"io"

	"github.com/gofiber/fiber/v2"
)

func FormDataReadFile(c *fiber.Ctx, fieldName string) (data []byte, filename string, err error) {
	file, err := c.FormFile(fieldName)
	if err != nil {
		return nil, "", err
	}

	f, err := file.Open()
	if err != nil {
		return nil, "", err
	}
	defer f.Close()

	data, err = io.ReadAll(f)
	if err != nil {
		return nil, "", err
	}

	return data, file.Filename, nil
}
