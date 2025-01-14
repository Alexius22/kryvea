package db

type Poc struct {
	Model
	Sections []Section `json:"sections"`
}

type Section struct {
	Type        string `json:"type"`
	Description string `json:"description"`
	Content     string `json:"content"`
	URL         string `json:"url"`
}
