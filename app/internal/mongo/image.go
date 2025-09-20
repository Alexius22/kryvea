package mongo

import (
	"errors"

	"github.com/gabriel-vasile/mimetype"
)

var (
	ImageTypeJpeg           = "jpg"
	ImageTypePng            = "png"
	MimeTypeJpeg            = "image/jpeg"
	MimeTypePng             = "image/png"
	SupportedImageMimeTypes = map[string]string{
		ImageTypeJpeg: MimeTypeJpeg,
		ImageTypePng:  MimeTypePng,
	}
)

var (
	ErrImageTypeNotAllowed error = errors.New("image type not allowed")
)

func IsImageTypeAllowed(data []byte) bool {
	mime := mimetype.Detect(data).String()
	_, ok := SupportedImageMimeTypes[mime]
	return ok
}
