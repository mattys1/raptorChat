package messaging

import (
	"context"
	"log"
	"strconv"

	"github.com/coder/websocket"
	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/db"
)

func subscribeAndNotify[T any, U any](
	subscription *Subscription,
	router *MessageRouter,
	conn *websocket.Conn,
	query func (reference uint64, dao *db.Queries) ([]U, error),
) {
	router.Subscribe(MessageEvent(subscription.EventName), subscription.Targets, conn)

	// TODO: actually this should be a map that maps target ID to the items of that target. if this is flattened, then  it's not that important 
	allItems := []U{}
	for i := range subscription.Targets {
		itemsOfTarget, err := query(uint64(subscription.Targets[i]), db.GetDao())
		assert.That(err == nil, "Failed retrieving items from target" + strconv.Itoa(subscription.Targets[i]), err)
		allItems = append(allItems, itemsOfTarget...)
	}

	resource, err := NewResource(MessageEvent(subscription.EventName), allItems)
	assert.That(err == nil, "Couldn't create resource", err)
	payload, err := NewMessage(MessageTypeCreate, resource)
	assert.That(err == nil, "Failed to create message", err)

	router.FillSubInOn(MessageEvent(subscription.EventName), conn, payload)
}

func sliceToSendable[O any, S any](original []O, convert func (org *O) S) []S {
	var sendable []S
	for _, item := range original {
		sendable = append(sendable, convert(&item))
	}
	return sendable
}

func handleSubscription(
	message *message,
	router *MessageRouter,
	conn *websocket.Conn,
) {
	subscription, err := GetMessageContents[Subscription](message)
	assert.That(err == nil, "Failed to get subscription from message", err)
	eventName := MessageEvent(subscription.EventName)

	switch eventName {
		case MessageEventChatMessages:
			subscribeAndNotify[db.Message](
				subscription,
				router,
				conn,
				func(reference uint64, dao *db.Queries) ([]db.Message, error) {
					return dao.GetMessagesByRoom(context.TODO(), reference)
				},
			)
		case MessageEventUsers:
			subscribeAndNotify[db.User](
				subscription,
				router,
				conn,
				func(reference uint64, dao *db.Queries) ([]*db.UserSendable, error) {
					users, err := dao.GetAllUsers(context.TODO())
					if err != nil {
						return nil, err
					}

					sendableUsers := sliceToSendable(users, func(user *db.User) *db.UserSendable { return user.ToSendable() })
					return sendableUsers, nil
				},
			)
		case MessageEventRooms:
			subscribeAndNotify[db.Room](
				subscription,
				router,
				conn,
				func(reference uint64, dao *db.Queries) ([]*db.RoomSendable, error) {
					rooms, err := dao.GetAllRooms(context.TODO())
					if err != nil {
						return nil, err
					}

					sendableRooms := sliceToSendable(rooms, func(room *db.Room) *db.RoomSendable { return room.ToSendable() }) 
					return sendableRooms, nil
				},
			)
	}
}

func createAndSend[T any](
	event MessageEvent,
	resource *Resource,
	router *MessageRouter,
	conn *websocket.Conn,
	matchAuthor func (item *T, user *db.User),
	getQualified func (dao *db.Queries, reference *T) ([]uint64, uint64, error),
	saveInDB func (dao *db.Queries, item *T) (int64, error),
	getClients func () map[*db.User]*websocket.Conn, // TODO: i've mentioned this somewhere else, but this needs to go
) {
	items, err := GetResourceContents[T](resource)
	assert.That(err == nil, "Failed to get resource contents", err)
	assert.That(len(items) == 1, "More than one item sent, unimplemented", nil)

	item := items[0]
	dao := db.GetDao()

	for u, c := range(getClients()) {
		if(c == conn) {
			matchAuthor(&item, u)
		}
	}

	qualified, reference, err := getQualified(dao, &item)
	assert.That(err == nil, "Failed to get qualified ids", err)

	_, err = saveInDB(dao, &item)
	assert.That(err == nil, "Failed to save item in DB", err)

	publishResource, err := NewResource(event, []T{item})
	assert.That(err == nil, "Failed to create publish resource", err)
	publish, err := NewMessage(MessageTypeCreate, publishResource)
	assert.That(err == nil, "Failed to create publish message", err)

	go router.Publish(event, publish, qualified, []uint64{reference}, getClients())

}

func handleCreate(
	message *message,
	router *MessageRouter,
	conn *websocket.Conn,
	getClients func () map[*db.User]*websocket.Conn,
) {
	resource, err := GetMessageContents[Resource](message)
	assert.That(err == nil, "Failed to get resource from message", err)
	event := MessageEvent(resource.EventName)

	switch MessageEvent(resource.EventName) {
	case MessageEventChatMessages:
		createAndSend(
			event, resource, router, conn,
			func (item *db.Message, user *db.User) {
				item.SenderID = user.ID
			},
			func (dao *db.Queries, item *db.Message) ([]uint64, uint64, error) {
				usersInRoom, err := dao.GetUsersByRoom(context.TODO(), item.RoomID)
				if err != nil {
					return nil, 0, err
				}
				var roomUserIDs []uint64

				for _, user := range usersInRoom {
					roomUserIDs = append(roomUserIDs, user.ID)
				}

				return roomUserIDs, item.RoomID, nil
			},
			func(dao *db.Queries, item *db.Message) (int64, error) {
				result, err := dao.CreateMessage(context.TODO(), db.CreateMessageParams{
					RoomID: item.RoomID,
					SenderID: item.SenderID,
					Contents: item.Contents,
				})

				if err != nil {
					return 0, err
				}

				id, err := result.LastInsertId()
				return id, err
			},
			getClients,
		)
	}
}

//TODO: this for now uses connections, but will switch over to clients once they are properly set up
// TODO: also getClients is an unholy abomination
func ListenForMessages(conn *websocket.Conn, router *MessageRouter, unregisterConn chan *websocket.Conn, getClients func () map[*db.User]*websocket.Conn) {
	defer func() {
		unregisterConn <- conn
		conn.Close(websocket.StatusNormalClosure, "Connection closing")
	}()

	for {
		mType, contents, err := conn.Read(context.Background())
		if err != nil {
			log.Println("Connection closed: ", err)
			break
		}

		log.Println("Message received: ", string(contents))
		assert.That(mType == websocket.MessageText, "Message arrived that's not text", nil)

		message, err := GetMessageFromJSON(contents) 
		assert.That(err == nil, "Failed to unmarshal message", err)
		log.Println("Unmarshalled message: ", message)

		switch MessageType(message.Type) {
		case MessageTypeSubscribe:
			log.Println("Message contents pre unmarshall: ", message.Contents)
			subscription, err := GetMessageContents[Subscription](message)
			assert.That(err == nil, "Failed to get subscription from message", err)

			log.Println("Subscription: ", subscription)
			// eventName := subscription.EventName

			handleSubscription(message, router, conn)
		case MessageTypeUnsubscribe:
			unsubscription, err := GetMessageContents[Subscription](message)

			assert.That(err == nil, "Failed to convert message contents to Unsubscription", nil)

			log.Println("UNSUBSCRIBE:", unsubscription)
			router.Unsubscribe(MessageEvent(unsubscription.EventName), unsubscription.Targets, conn)
		
		case MessageTypeCreate:
			handleCreate(message, router, conn, getClients)
		default:
			log.Println("Unknown message type: ", message.Type)
		}
	}
}
