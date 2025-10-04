package poc

import (
	"bytes"
	"image/jpeg"
	"image/png"
)

func IsValidType(t string) bool {
	if _, ok := PocTypes[t]; ok {
		return true
	}
	return false
}

// IsValidPNG checks if the given []byte is a valid PNG image.
func IsValidPNG(data []byte) bool {
	if len(data) < 8 {
		return false
	}

	pngHeader := []byte{137, 80, 78, 71, 13, 10, 26, 10}
	if !bytes.Equal(data[:8], pngHeader) {
		return false
	}

	_, err := png.Decode(bytes.NewReader(data))
	return err == nil
}

// IsValidJPEG checks if the given []byte represents a valid JPEG image.
func IsValidJPEG(data []byte) bool {
	if len(data) < 4 {
		return false
	}

	if !(data[0] == 0xFF && data[1] == 0xD8) {
		return false
	}

	if !(data[len(data)-2] == 0xFF && data[len(data)-1] == 0xD9) {
		return false
	}

	_, err := jpeg.Decode(bytes.NewReader(data))
	return err == nil
}
