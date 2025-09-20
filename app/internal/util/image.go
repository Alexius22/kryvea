package util

import (
	"errors"
	"slices"

	"github.com/gabriel-vasile/mimetype"
)

var (
	ErrImageTypeNotAllowed error = errors.New("image type not allowed")
)

var allowedImageMimeTypes []string = []string{
	"image/jpeg",
	"image/png",
}

func IsImageTypeAllowed(data []byte) bool {
	mime := mimetype.Detect(data).String()
	return slices.Contains(allowedImageMimeTypes, mime)
}
