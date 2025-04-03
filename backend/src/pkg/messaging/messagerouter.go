package messaging

import (
	"context"
	"encoding/json"
	"log"

	"github.com/coder/websocket"

	"github.com/mattys1/raptorChat/src/pkg/assert"
	"slices"
)

type Subscriber struct {
	InterestedIds []int
	conn *websocket.Conn
}

type MessageRouter struct {
	subscribers map[MessageEvent][]*Subscriber // TODO: this should probably be changed to Clients, like most of the code
}

func NewMessageRouter() *MessageRouter {
	return &MessageRouter{
		subscribers: make(map[MessageEvent][]*Subscriber),
	}
}

func (router *MessageRouter) Subscribe(event MessageEvent, targetIds []int, conn *websocket.Conn) {
	assert.That(slices.Equal(targetIds, slices.Compact(targetIds)), "Target IDs should not contain duplicates", nil)
	assert.That(slices.Equal(targetIds, []int{}), "Target IDs should not be empty", nil)

	if _, ok := router.subscribers[event]; !ok {
		router.subscribers[event] = append(router.subscribers[event], )
		return
	}

	subscribers := router.subscribers[event]
	connIdx := slices.IndexFunc(subscribers, func(sub *Subscriber) bool {
		return sub.conn == conn
	})

	if connIdx != -1 {
		subscribers = append(subscribers, &Subscriber{
			InterestedIds: targetIds,
			conn: conn,
		})

		assert.That(
			!slices.Equal(subscribers, router.subscribers[event]),
			"New subscribers and old router.subscribers are equal, even after modification",
			nil,
		)

		router.subscribers[event] = subscribers
		return
	}

	ids := subscribers[connIdx].InterestedIds
	
	for id := range targetIds {
		if slices.Contains(ids, id) {
			continue
		}
		ids = append(ids, id)
	}

	assert.That(
		!slices.Equal(subscribers, router.subscribers[event]),
		"New subscribers and old router.subscribers are equal, even after modification",
		nil,
	)

	router.subscribers[event] = subscribers
	
	log.Println("Connection subscribed to", event)
	log.Println("Subscribers of ", event, ":", router.subscribers[event])
}

func (router *MessageRouter) Unsubscribe(event MessageEvent, targetIds []int, conn *websocket.Conn) {
	subs := router.subscribers[event]
	for i, s := range subs {
		if s.conn == conn {
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

func (router *MessageRouter) Publish(event MessageEvent, originatorId int, message Message) {
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
