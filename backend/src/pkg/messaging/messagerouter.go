package messaging

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/coder/websocket"
	pp "github.com/k0kubun/pp/v3"

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

	subsBefore := make([]*Subscriber, len(router.subscribers[event])) 
	copy(subsBefore, router.subscribers[event])
	subscribers := router.subscribers[event] //redundant, maybe

	defer func() {
		assert.That(
			!slices.Equal(subsBefore, router.subscribers[event]),
			fmt.Sprintf("New subscribers and old router.subscribers are equal, even after subscribing: %s", pp.Sprint(subscribers)),
			nil,
		)

		assert.That(!slices.Contains(subscribers, nil),
			fmt.Sprintf("Subscribed with nil: %v", subscribers), nil)


		pp.Default.SetExportedOnly(true)
		log.Println("Connection subscribed to", event)
		log.Println("Subscribers of", event, ":", pp.Sprint(router.subscribers[event]))
		pp.Default.SetExportedOnly(false)
	}()

	if _, ok := router.subscribers[event]; !ok {
		router.subscribers[event] = append(router.subscribers[event], &Subscriber{
			InterestedIds: targetIds,
			conn: conn,
		})
		return
	}

	connIdx := slices.IndexFunc(subscribers, func(sub *Subscriber) bool {
		return sub.conn == conn
	})

	if connIdx == -1 {
		subscribers = append(subscribers, &Subscriber{
			InterestedIds: targetIds,
			conn: conn,
		})

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

	router.subscribers[event] = subscribers
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

	defer func() {
		assert.That(
			!slices.Equal(subs, router.subscribers[event]),
			"New subscribers and old router.subscribers are equal, even after unsubscribing -- before:" + pp.Sprint(subs),
			nil,
		)

		for _, subs := range router.subscribers {
			assert.That(!slices.Contains(subs, nil), fmt.Sprintf("nil subscriber in subscribers of %s: %v", event, subs), nil)
		}
	}()

	subs[connIdx].InterestedIds = slices.DeleteFunc(interested, func(id int) bool {
		log.Println("Deleting ID", id, "from", interested, "in", connIdx)
		return slices.Contains(targetIds, id)
	})

	if len(subs[connIdx].InterestedIds) == 0 {
		log.Println("Subscriber:", subs[connIdx], "unsubscribed completely. Client:", conn)
		router.subscribers[event] = slices.Delete(subs, connIdx, connIdx + 1)
		// return
	}

	if len(router.subscribers[event]) == 0 {
		delete(router.subscribers, event)
		log.Println("Unsubscribed from:", event, "completely.")
	}
}

func (router *MessageRouter) UnsubscribeAll(conn *websocket.Conn) {
	log.Println("UNSUBSCRIBING ALL", router.subscribers)
	for event, subs := range router.subscribers {
		assert.That(!slices.Contains(subs, nil), fmt.Sprintf("Subscribers should not contain nil: %v", subs), nil)
		// subs = slices.DeleteFunc(subs, func(sub *Subscriber) bool {
		// 	log.Println("Deleting subscriber", sub, "from", subs, "in", conn)
		// 	return sub.conn == conn
		// })

		connIdx := slices.IndexFunc(subs, func(sub *Subscriber) bool {
			return sub.conn == conn
		})

		if connIdx == -1 {
			continue
		}

		router.Unsubscribe(event, subs[connIdx].InterestedIds, conn)
	}

}

func (router *MessageRouter) Publish(
	event MessageEvent,
	message *message,
	qualifiedUsers []uint64,
	publishedIds []uint64, // should publish multiple messages, each corresponding to a specific set of `interestedAndQualified`. this will work fine if there's a single resource in a message. TODO: needs a big refactor
	allClients map[*db.User]*websocket.Conn,
) { // FIXME: allClients sucks 
	marshalled, err := json.Marshal(message)
	assert.That(err == nil, "Failed to marshal published message", err)

	log.Println("Publishing to subscribers of ", event, ":", router.subscribers[event])
	log.Println("Qualified users:", qualifiedUsers)
	for _, sub := range router.subscribers[event] {
		uid := connToUID(sub.conn, allClients)

		if slices.Index(qualifiedUsers, uid) == -1 {
			continue
		}

		log.Println("Event:", event, "User", uid, "Interested Resources:", sub.InterestedIds, "Published Resources:", publishedIds)

		interested := false
		if interested = sub.InterestedIds[0] == -1; !interested {
			for _, pid := range publishedIds {
				if slices.Contains(sub.InterestedIds, int(pid)) {
					interested = true
				}
			}
		}

		if interested == false {
			continue
		}
		
		log.Println("Sending message of", event, "to user", uid)
		log.Println("Contents of published message:", string(marshalled))
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

// func FillSubInOn[T any](router *MessageRouter, event MessageEvent, conn *websocket.Conn, query func (q *db.Queries) (ctx context.Context, userID uint64) ([]T, error)
func FillSubInOn[T any](
	router *MessageRouter,
	event MessageEvent,
	conn *websocket.Conn,
	userId uint64,
	dao *db.Queries,
	qualified func(dao *db.Queries, userID uint64) ([]T, error),
	itemId func(item *T) uint64,
) {
	subs := router.subscribers[event]
	connIdx := slices.IndexFunc(subs, func(sub *Subscriber) bool { return sub.conn == conn })
	items, err := qualified(dao, userId)
	assert.That(err == nil, "Failed to get items of subscriber", err)

	itemIds := make([]uint64, len(items))
	for i, item := range items {
		itemIds[i] = itemId(&item)
	}

	var interestedItems []T
	if subs[connIdx].InterestedIds[0] == -1 {
		interestedItems = items
	} else {
		for _, id := range subs[connIdx].InterestedIds {
			for j, item := range items {
				if itemId(&items[j]) == uint64(id) {
					interestedItems = append(interestedItems, item)
					break
				}
			}
		}
	}

	itemsResource, err := NewResource(event, interestedItems)
	assert.That(err == nil, "Failed to create resource", err)
	message, err := NewMessage(MessageTypeCreate, itemsResource)
	assert.That(err == nil, "Failed to create message", err)

	log.Println("Filling in subscriber", conn, "on", event, "with items", items, "\tMessage: ", message)
	router.SendMessageToSub(event, conn, message)
}

// TODO: this method will probably become unnecessary, as targetIDs will be more integrated into the client.
// What did i mean here?
func (router *MessageRouter) SendMessageToSub(event MessageEvent, conn *websocket.Conn, message *message) {
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

	log.Println("Message sent to", conn, "\tMessage:", string(marshalled))
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
