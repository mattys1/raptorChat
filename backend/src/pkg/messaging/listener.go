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
			// switch MessageEvent(eventName) {
			// case MessageEventChatMessages:
			// 	// test
			// case MessageEventUsers:
			// 	router.Subscribe(MessageEventUsers, subscription.Targets, conn)
			//
			// 	users, err := db.GetDao().GetAllUsers(context.TODO())
			// 	assert.That(err == nil, "Failed to get users from db", err)
			//
			// 	var sendableUsers []any
			// 	for _, user := range users {
			// 		sendableUsers = append(sendableUsers, user.ToSendable())	
			// 	}
			//
			// 	resource, err := NewResource(MessageEventUsers, sendableUsers)
			// 	assert.That(err == nil, "Failed to create resource", err)
			//
			// 	payload, err := NewMessage(MessageTypeCreate, resource)
			//
			// 	assert.That(err == nil, "Failed to create message", err)
			//
			// 	go router.FillSubInOn(
			// 		MessageEventUsers,
			// 		conn,
			// 		payload,
			// 	)
			// case MessageEventRooms:
			// 	log.Println("Chat subscription")
			// 	router.Subscribe(MessageEvent(eventName), subscription.Targets, conn)
			// 	rooms, err := db.GetDao().GetAllRooms(context.TODO())
			// 	assert.That(err == nil, "Failed to get rooms from db", err)
			//
			// 	sendableRooms := make([]any, len(rooms))
			// 	for i, room := range rooms {
			// 		sendableRooms[i] = room.ToSendable()
			// 	}
			//
			// 	log.Println("Publishing rooms", sendableRooms)
			//
			// 	resource, err := NewResource(MessageEventRooms, sendableRooms)
			// 	payload, err := NewMessage(MessageTypeCreate, resource)
			//
			// 	assert.That(err == nil, "Failed to create message", err)
			//
			// 	router.FillSubInOn(
			// 		MessageEventRooms,
			// 		conn,
			// 		payload,
			// 	)
			// }
			//
		case MessageTypeUnsubscribe:
			unsubscription, err := GetMessageContents[Subscription](message)

			assert.That(err == nil, "Failed to convert message contents to Unsubscription", nil)

			log.Println("UNSUBSCRIBE:", unsubscription)
			router.Unsubscribe(MessageEvent(unsubscription.EventName), unsubscription.Targets, conn)
		
		case MessageTypeCreate:
			resource, err := GetMessageContents[Resource](message)
			assert.That(err == nil, "Couldnt parse create message", err)
			event := MessageEvent(resource.EventName)

			switch event {
			case MessageEventChatMessages:
				log.Println("Chat message sent", resource.Contents)
				chatMessages, err := GetResourceContents[db.Message](resource)
				assert.That(err == nil, "Couldnt convert contents to db.Message", err)
				assert.That(len(chatMessages) == 1, "More than one message sent, unimplemented", nil)

				chatMessage := chatMessages[0]

				assert.That(chatMessage.ID == 0, "Message sent with a known ID", nil)
				assert.That(chatMessage.SenderID == 0, "Message sent with a known sender ID", nil)

				dao := db.GetDao()

				for u, c := range(getClients()) {
					if(c == conn) {
						chatMessage.SenderID = u.ID
					}
				}
				log.Println("Chat message sender ID: ", chatMessage.SenderID)

				usersInRoom, err := dao.GetUsersByRoom(context.TODO(), chatMessage.RoomID) 
				assert.That(err == nil, "Can't get users in room", err)
				log.Println("Users in room: ", usersInRoom)

				var roomUserIDs []uint64

				for _, user := range usersInRoom {
					roomUserIDs = append(roomUserIDs, user.ID)
				}

				dao.CreateMessage(context.TODO(), db.CreateMessageParams{
					RoomID: chatMessage.RoomID,	
					SenderID: chatMessage.SenderID,
					Contents: chatMessage.Contents,
				})

				publishResource, err := NewResource(
					MessageEventChatMessages,
					[]db.Message{chatMessage},
				)

				assert.That(err == nil, "Failed to create publish resource", err)

				publish, err := NewMessage(MessageTypeCreate, publishResource)

				// lastInsertID, err := result.LastInsertId()
				// assert.That(err == nil, "Failed to get last insert ID", err)

				go router.Publish(event, publish, roomUserIDs, []uint64{chatMessage.RoomID}, getClients())
			}
			

		default:
			log.Println("Unknown message type: ", message.Type)
		}
	}
}
