package poc

const (
	POC_TYPE_TEXT    = "text"
	POC_TYPE_REQUEST = "request/response"
	POC_TYPE_IMAGE   = "image"
)

var (
	POCTypes = map[string]struct{}{
		POC_TYPE_TEXT:    {},
		POC_TYPE_REQUEST: {},
		POC_TYPE_IMAGE:   {},
	}
)
