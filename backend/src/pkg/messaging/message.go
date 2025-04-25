package messaging

import (
	"encoding/json"
	"log"
)

type EventResource struct {
	Channel string `json:"channel"`
	Method string `json:"method"`
	EventName string `json:"event_name"`
	Contents json.RawMessage `json:"contents"`
}

// type Resource struct {
// 	EventName string `json:"eventName"`	
// 	Contents json.RawMessage `json:"contents"`
// }
//
// type Subscription struct {
// 	EventName string `json:"eventName"`
// 	Targets []int `json:"targetIds"`
// }

func GetEventResourceContents[T any](resource *EventResource) (*T, error) {
	var contents T

	log.Println("Message contents: ", string(resource.Contents))
	if err := json.Unmarshal(resource.Contents, &contents); err != nil {
		return &contents, err
	}

	log.Println("Unmarashalled contents:", contents, "JSON:", string(resource.Contents))

	return &contents, nil
}

// func NewMessage[T Resource | Subscription](mType MessageType, contents *T) (*EventResource, error) {
// 	assert.That(contents != nil, "Resource is nil during message creation", nil)
//
// 	contentsData, err := json.Marshal(contents)
// 	if err != nil {
// 		return nil, err	
// 	} 
//
// 	return &EventResource{
// 		Type: string(mType),
// 		Contents: contentsData,
// 	}, nil
// }
//
// func GetMessageFromJSON(contents []byte) (*EventResource, error) {
// 	var msg EventResource
// 	if err := json.Unmarshal(contents, &msg); err != nil {
// 		return nil, err
// 	}
//
// 	return &msg, nil
// }
//
// func GetResourceContents[T any](resource *Resource) ([]T, error) {
// 	var contents []T
//
// 	log.Println("Resource contents: ", string(resource.Contents))
// 	if err := json.Unmarshal(resource.Contents, &contents); err != nil {
// 		return contents, err
// 	}
//
// 	log.Println("Unmarashalled contents:", contents, "JSON:", string(resource.Contents))
//
// 	return contents, nil
// }
//
// func NewResource[T any](event MessageEvent, contents []T) (*Resource, error) {
// 	contentsData, err := json.Marshal(contents)
// 	if err != nil {
// 		return nil, err	
// 	} 
//
// 	return &Resource{
// 		EventName: string(event),
// 		Contents: contentsData,
// 	}, nil
//
