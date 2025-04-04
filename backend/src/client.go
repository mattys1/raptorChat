package main

import (
	"context"
	"log"
	"strconv"

	"github.com/coder/websocket"
	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/db"

	msg "github.com/mattys1/raptorChat/src/pkg/messaging"
)

type Client struct {
	User *db.User `json:"user"`
	// IP string `json:"ip"`
	Connection *websocket.Conn 
}

//TODO: this for now uses connections, but will switch over to clients once they are properly set up
// TODO: really have to put this somewhere else
func listenForMessages(conn *websocket.Conn, router *msg.MessageRouter) {
	defer func() {
		GetHub().Unregister <- conn
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

		message, err := msg.GetMessageFromJSON(contents) 
		assert.That(err == nil, "Failed to unmarshal message", err)
		log.Println("Unmarshalled message: ", message)

		switch msg.MessageType(message.Type) {
		case msg.MessageTypeSubscribe:
			log.Println("Message contents pre unmarshall: ", message.Contents)
			subscription, err := msg.GetMessageContents[msg.Subscription](message)
			assert.That(err == nil, "Failed to get subscription from message", err)

			log.Println("Subscription: ", subscription)
			eventName := subscription.EventName

			switch msg.MessageEvent(eventName) {
			case msg.MessageEventChatMessages:
				router.Subscribe(msg.MessageEvent(eventName), subscription.Targets, conn)

				subscription, err := msg.GetMessageContents[msg.Subscription](message)
				assert.That(err == nil, "Failed to get subscription from message", err)
				// TODO: so, we need to implement a query to get all messages for a specific room, then we just send it out, pray that everything works, and then implement sending of messages, fuck editing and deleting
				dao := db.GetDao()

				messagesInAllRooms := make([][]db.Message, len(subscription.Targets))
				for i := range messagesInAllRooms {
					messagesInRoom, err := dao.GetMessagesByRoom(context.TODO(), uint64(subscription.Targets[i]))
					assert.That(err == nil, "Failed retrieving messages from room" + strconv.Itoa(subscription.Targets[i]), err)

					messagesInAllRooms[i] = messagesInRoom
				}

				resource, err := msg.NewResource(msg.MessageEvent(eventName), messagesInAllRooms)
				assert.That(err == nil, "Couldn't create resource", err)

				payload, err := msg.NewMessage(msg.MessageTypeCreate, resource)

				router.FillSubInOn(msg.MessageEvent(eventName), conn, payload)

			case msg.MessageEventUsers:
				router.Subscribe(msg.MessageEventUsers, subscription.Targets, conn)

				users, err := db.GetDao().GetAllUsers(context.TODO())
				assert.That(err == nil, "Failed to get users from db", err)

				var sendableUsers []any
				for _, user := range users {
					sendableUsers = append(sendableUsers, user.ToSendable())	
				}

				resource, err := msg.NewResource(msg.MessageEventUsers, sendableUsers)
				assert.That(err == nil, "Failed to create resource", err)

				payload, err := msg.NewMessage(msg.MessageTypeCreate, resource)

				assert.That(err == nil, "Failed to create message", err)

				go router.FillSubInOn(
					msg.MessageEventUsers,
					conn,
					payload,
				)
			case msg.MessageEventRooms:
				log.Println("Chat subscription")
				router.Subscribe(msg.MessageEvent(eventName), subscription.Targets, conn)
				rooms, err := db.GetDao().GetAllRooms(context.TODO())
				assert.That(err == nil, "Failed to get rooms from db", err)

				sendableRooms := make([]any, len(rooms))
				for i, room := range rooms {
					sendableRooms[i] = room.ToSendable()
				}

				log.Println("Publishing rooms", sendableRooms)

				resource, err := msg.NewResource(msg.MessageEventRooms, sendableRooms)
				payload, err := msg.NewMessage(msg.MessageTypeCreate, resource)

				assert.That(err == nil, "Failed to create message", err)

				router.FillSubInOn(
					msg.MessageEventRooms,
					conn,
					payload,
				)
			}
			
		case msg.MessageTypeUnsubscribe:
			unsubscription, err := msg.GetMessageContents[msg.Subscription](message)

			assert.That(err == nil, "Failed to convert message contents to Unsubscription", nil)

			log.Println("UNSUBSCRIBE:", unsubscription)
			router.Unsubscribe(msg.MessageEvent(unsubscription.EventName), unsubscription.Targets, conn)
		
		case msg.MessageTypeCreate:
			resource, err := msg.GetMessageContents[msg.Resource](message)
			assert.That(err == nil, "Couldnt parse create message", err)
			event := msg.MessageEvent(resource.EventName)

			switch event {
			case msg.MessageEventChatMessages:
				log.Println("Chat message sent", resource.Contents)
				chatMessages, err := msg.GetResourceContents[db.Message](resource)
				assert.That(err == nil, "Couldnt convert contents to db.Message", err)
				assert.That(len(chatMessages) == 1, "More than one message sent, unimplemented", nil)

				chatMessage := chatMessages[0]

				assert.That(chatMessage.ID == 0, "Message sent with a known ID", nil)
				assert.That(chatMessage.SenderID == 0, "Message sent with a known sender ID", nil)

				dao := db.GetDao()

				for u, c := range(GetHub().Clients) {
					if(c == conn) {
						chatMessage.SenderID = u.ID
					}
				}
				log.Println("Chat message sender ID: ", chatMessage.SenderID)

				usersInRoom, err := dao.GetUsersByRoom(context.TODO(), chatMessage.SenderID) 
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

				router.Publish(event, message, roomUserIDs, GetHub().Clients)
			}
			

		default:
			log.Println("Unknown message type: ", message.Type)
		}
	}
}

// func testSomePings(router *msg.MessageRouter) {
// 	time.Sleep(3 * time.Second)
//
// 	router.Publish(msg.MessageEventChatMessages, msg.Message{
// 		Type: string(msg.MessageTypeCreate),
// 		Contents: msg.Resource{
// 			EventName: string(msg.MessageEventChatMessages),
// 			Contents:  []any{
// 				db.Message{
// 					SenderID: 1,
// 					RoomID: 1,
// 					Contents: "Test message was succesfully sent",
// 				},
// 			},
// 		},
// 	})
// }
