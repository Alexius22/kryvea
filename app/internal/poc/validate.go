package poc

import (
	"bytes"
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
		return false // PNG header is 8 bytes
	}

	// Check PNG signature
	pngHeader := []byte{137, 80, 78, 71, 13, 10, 26, 10}
	if !bytes.Equal(data[:8], pngHeader) {
		return false
	}

	// Try to decode the image
	_, err := png.Decode(bytes.NewReader(data))
	return err == nil
}
