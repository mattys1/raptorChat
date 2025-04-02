package main

import (
	"context"
	"encoding/json"
	"log"
	"time"

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

		var message msg.Message; json.Unmarshal(contents, &message)
		log.Println("Message: ", message)

		switch msg.MessageType(message.Type) {
		case msg.MessageTypeSubscribe:
			eventName, success := message.Contents.(string)
			assert.That(success, "Failed to convert message contents to string", nil)

			switch msg.MessageEvent(eventName) {
			case msg.MessageEventChatMessages:
				router.Subscribe(msg.MessageEvent(eventName), conn)
			
			case msg.MessageEventUsers:
				router.Subscribe(msg.MessageEventUsers, conn)

				users, err := db.GetDao().GetAllUsers(context.TODO())
				assert.That(err == nil, "Failed to get users from db", err)

				var sendableUsers []any
				for _, user := range users {
					sendableUsers = append(sendableUsers, user.ToSendable())	
				}

				go router.Publish(
					msg.MessageEventUsers,
					msg.Message{
						Type: string(msg.MesssageTypeCreate),	
						Contents: msg.Resource{
							EventName: string(msg.MessageEventUsers),
							Contents: sendableUsers,
						},
					},
				)
			case msg.MessageEventRooms:
				log.Println("Chat subscription")
				router.Subscribe(msg.MessageEvent(eventName), conn)
				rooms, err := db.GetDao().GetAllRooms(context.TODO())
				assert.That(err == nil, "Failed to get rooms from db", err)

				sendableRooms := make([]any, len(rooms))
				for i, room := range rooms {
					sendableRooms[i] = room.ToSendable()
				}

				log.Println("Publishing rooms", sendableRooms)
				router.Publish(
					msg.MessageEventRooms,
					msg.Message{
						Type: string(msg.MesssageTypeCreate),
						Contents: msg.Resource{
							EventName: string(msg.MessageEventRooms),
							Contents: sendableRooms,
						},
					},
				)
			}
			
		case msg.MessageTypeUnsubscribe:
			eventName, success := message.Contents.(string)
			assert.That(success, "Failed to convert message contents to string", nil)

			router.Unsubscribe(msg.MessageEvent(eventName), conn)
			

		default:
			log.Println("Unknown message type: ", message.Type)
		}
	}
}

func testSomePings(router *msg.MessageRouter) {
	time.Sleep(3 * time.Second)

	router.Publish(msg.MessageEventChatMessages, msg.Message{
		Type: string(msg.MesssageTypeCreate),
		Contents: msg.Resource{
			EventName: string(msg.MessageEventChatMessages),
			Contents:  []any{
				db.Message{
					SenderID: 1,
					RoomID: 1,
					Contents: "Test message was succesfully sent",
				},
			},
		},
	})
}
