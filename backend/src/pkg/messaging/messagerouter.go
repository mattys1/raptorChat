package messaging

import (
	"context"
	"encoding/json"
	"log"

	"github.com/coder/websocket"

	"slices"

	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/db"
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
	assert.That(len(targetIds) != 0, "Target IDs should not be empty", nil)

	log.Println("Connection", conn, "subscribing to", event, "with target IDs", targetIds)

	if _, ok := router.subscribers[event]; !ok {
		router.subscribers[event] = append(router.subscribers[event], &Subscriber{
			InterestedIds: targetIds,
			conn: conn,
		})
		return
	}

	subscribers := router.subscribers[event]
	connIdx := slices.IndexFunc(subscribers, func(sub *Subscriber) bool {
		return sub.conn == conn
	})

	if connIdx == -1 {
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
	assert.That(slices.Equal(targetIds, slices.Compact(targetIds)), "Target IDs should not contain duplicates", nil)
	assert.That(len(targetIds) != 0, "Target IDs should not be empty", nil)

	subs := router.subscribers[event]
	connIdx := slices.IndexFunc(subs, func(sub *Subscriber) bool {
		return sub.conn == conn
	})
	assert.That(connIdx != -1, "Connection not found in subscribers", nil)

	interested := subs[connIdx].InterestedIds

	subs[connIdx].InterestedIds = slices.DeleteFunc(interested, func(id int) bool {
		log.Println("Deleting ID", id, "from", interested, "in", connIdx)
		return slices.Contains(targetIds, id)
	})

	if len(subs[connIdx].InterestedIds) == 0 {
		log.Println("Subscriber:", subs[connIdx], "unsubscribed completely. Client:", conn)
		router.subscribers[event] = slices.Delete(subs, connIdx, connIdx + 1)

		return
	}

	if len(router.subscribers[event]) == 0 {
		delete(router.subscribers, event)
		log.Println("Unsubscribed from:", event, "completely.")
	}
}

// func (router *MessageRouter) UnsubscribeAll(conn *websocket.Conn) {
// 	for event, subs := range router.subscribers {
// 		for i, c := range subs {
// 			if c == conn {
// 				router.subscribers[event] = slices.Delete(subs, i, i+1)
// 				break
// 			}
// 		}
// 	}
// }

func (router *MessageRouter) Publish(event MessageEvent, message *message, qualifiedUsers []uint64, allClients map[*db.User]*websocket.Conn) { // FIXME: FIXME: FIXME: FIXME: FIXME: FIXME: 
	marshalled, err := json.Marshal(message)
	assert.That(err == nil, "Failed to marshal published message", err)

	log.Println("Publishing to subscribers of ", event, ":", router.subscribers[event])
	log.Println("Qualified users:", qualifiedUsers)
	for _, sub := range router.subscribers[event] {
		uid := connToUID(sub.conn, allClients)

		if slices.Index(qualifiedUsers, uid) == -1 {
			continue
		}

		log.Println("Sending message of", event, "to user", uid)
		sub.conn.Write(
			context.TODO(),
			websocket.MessageText,
			marshalled,
		)

		// for u, c := range(allClients) {
		// 	if slices.Index(qualifiedUsers, u.ID) == -1 {
		// 		continue
		// 	}
		//
		// 	if(c == sub.conn) {
		// 	}
		// }
	}
}

// TODO: this method will probably become unnecessary, as targetIDs will be more integrated into the client. 
func (router *MessageRouter) FillSubInOn(event MessageEvent, conn *websocket.Conn, message *message) {
	assert.That(slices.IndexFunc(router.subscribers[event], func(sub *Subscriber) bool {
		return sub.conn == conn
		}) != -1,
		"There doesn't exist a connection in subscribers to be filled in on",
		nil,
	)

	marshalled, err := json.Marshal(message)
	assert.That(err == nil, "Failed to marshal fill-in message", err)

	conn.Write(
		context.TODO(),
		websocket.MessageText,
		marshalled,
	)

	log.Println("Fill-in message sent to", conn, "Message:", string(marshalled))
}

// FIXME: FIXME: FIXME:
func connToUID(conn *websocket.Conn, allClients map[*db.User]*websocket.Conn) uint64 {
	for u, c := range(allClients) {
		if c == conn {
			return u.ID
		}
	}

	return 0
}
