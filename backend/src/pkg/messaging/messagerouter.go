package messaging

import (
	"context"
	"encoding/json"
	"log"

	"github.com/coder/websocket"

	"github.com/mattys1/raptorChat/src/pkg/assert"
	"slices"
)

type MessageRouter struct {
	subscribers map[MessageEvent][]*websocket.Conn // TODO: this should probably be changed to Clients, like most of the code
}

func NewMessageRouter() *MessageRouter {
	return &MessageRouter{
		subscribers: make(map[MessageEvent][]*websocket.Conn),
	}
}

func (router *MessageRouter) Subscribe(event MessageEvent, conn *websocket.Conn) {
	router.subscribers[event] = append(router.subscribers[event], conn)
	log.Println("Connection subscribed to", event)
	log.Println("Subscribers of ", event, ":", router.subscribers[event])
}

func (router *MessageRouter) Unsubscribe(event MessageEvent, conn *websocket.Conn) {
	subs := router.subscribers[event]
	for i, c := range subs {
		if c == conn {
			router.subscribers[event] = slices.Delete(subs, i, i+1)
			log.Println("Unsubscribed from:", event, "Client:", conn)
			break
		}
	}
}

func (router *MessageRouter) UnsubscribeAll(conn *websocket.Conn) {
	for event, subs := range router.subscribers {
		for i, c := range subs {
			if c == conn {
				router.subscribers[event] = slices.Delete(subs, i, i+1)
				break
			}
		}
	}
}

func (router *MessageRouter) Publish(event MessageEvent, message Message) {
	marshalled, err := json.Marshal(message)
	assert.That(err == nil, "Failed to marshal published message", err)

	log.Println("Subscribers of ", event, ":", router.subscribers[event])
	for _, conn := range router.subscribers[event] {
		log.Println("Sending message to", event, "subscribers")
		conn.Write(
			context.TODO(),
			websocket.MessageType(websocket.MessageText),
			marshalled,
		)
	}
}
