package util

import (
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
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

func CreateImageReference(filename string, id uuid.UUID) string {
	ext := filepath.Ext(filename)
	base := strings.TrimSuffix(filename, ext)

	newFilename := fmt.Sprintf("%s_%s%s", base, id.String(), ext)
	return newFilename
}
