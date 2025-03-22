package messaging

type Message struct {
	Type string `json:"type"`
	Contents interface{} `json:"contents"`
}
