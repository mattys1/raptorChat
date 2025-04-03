package main

import (
	"context"
	"log"

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
				router.Subscribe(msg.MessageEvent(eventName), []int{-1}, conn)
			
			case msg.MessageEventUsers:
				router.Subscribe(msg.MessageEventUsers, []int{-1}, conn)

				users, err := db.GetDao().GetAllUsers(context.TODO())
				assert.That(err == nil, "Failed to get users from db", err)

				var sendableUsers []any
				for _, user := range users {
					sendableUsers = append(sendableUsers, user.ToSendable())	
				}

				publish, err := msg.NewMessage(msg.MessageTypeCreate, &msg.Resource{
					EventName: string(msg.MessageEventUsers),
					Contents: sendableUsers,
				})

				assert.That(err == nil, "Failed to create message", err)

				go router.FillSubInOn(
					msg.MessageEventUsers,
					conn,
					publish,
				)
			case msg.MessageEventRooms:
				log.Println("Chat subscription")
				router.Subscribe(msg.MessageEvent(eventName), []int{-1}, conn)
				rooms, err := db.GetDao().GetAllRooms(context.TODO())
				assert.That(err == nil, "Failed to get rooms from db", err)

				sendableRooms := make([]any, len(rooms))
				for i, room := range rooms {
					sendableRooms[i] = room.ToSendable()
				}

				log.Println("Publishing rooms", sendableRooms)

				publish, err := msg.NewMessage(msg.MessageTypeCreate, &msg.Resource{
					EventName: string(msg.MessageEventRooms),
					Contents: sendableRooms,
				})

				assert.That(err == nil, "Failed to create message", err)

				router.FillSubInOn(
					msg.MessageEventRooms,
					conn,
					publish,
				)
			}
			
		case msg.MessageTypeUnsubscribe:
			unsubscription, err := msg.GetMessageContents[msg.Subscription](message)

			assert.That(err == nil, "Failed to convert message contents to Unsubscription", nil)

			router.Unsubscribe(msg.MessageEvent(unsubscription.EventName), []int{-1},  conn)
			

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
