package messaging

import (
	"encoding/json"
	"log"

	"github.com/mattys1/raptorChat/src/pkg/assert"
)

type message struct {
	Type string `json:"type"`
	Contents json.RawMessage `json:"contents"`
}

type Resource struct {
	EventName string `json:"eventName"`	
	Contents any `json:"contents"`
}

type Subscription struct {
	EventName string `json:"eventName"`
	Targets []int `json:"targetIds"`
}

func GetMessageContents[T Resource | Subscription](message *message) (*T, error) {
	var contents T

	log.Println("Message contents: ", string(message.Contents))
	if err := json.Unmarshal(message.Contents, &contents); err != nil {
		return &contents, err
	}

	log.Println("Unmarashalled contents:", contents, "JSON:", string(message.Contents))

	return &contents, nil
}

func NewMessage[T Resource | Subscription](mType MessageType, contents *T) (*message, error) {
	assert.That(contents != nil, "Resource is nil during message creation", nil)

	contentsData, err := json.Marshal(contents)
	if err != nil {
		return nil, err	
	} 

	return &message{
		Type: string(mType),
		Contents: contentsData,
	}, nil
}

func GetMessageFromJSON(contents []byte) (*message, error) {
	var msg message
	if err := json.Unmarshal(contents, &msg); err != nil {
		return nil, err
	}

	return &msg, nil
}
