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
	defer conn.Close(websocket.StatusNormalClosure, "Connection closing")

	for {
		mType, contents, err := conn.Read(context.Background())
		log.Println("Message received: ", string(contents))
		assert.That(mType == websocket.MessageText, "Message arrived that's not text", nil)

		var message msg.Message; json.Unmarshal(contents, &message)
		log.Println("Message: ", message)

		switch msg.MessageType(message.Type) {
		case msg.MessageTypeSubscribe:
			event, success := message.Contents.(string)
			event = string(msg.MessageEvent(event))
			assert.That(success, "Failed to convert message contents to MessageEvent", nil)

			switch msg.MessageEvent(event) {
			case msg.MessageEventChatMessages:
				router.Subscribe(msg.MessageEvent(event), conn)
				go conn.Write(context.TODO(), websocket.MessageType(websocket.MessageText), []byte("User has subscribed to chat messages"))
				go testSomePings(router)
			}
		default:
			log.Println("Unknown message type: ", message.Type)
		}

		if err != nil {
			log.Println("Connection closed: ", err)
			break
		}
	}
}

func testSomePings(router *msg.MessageRouter) {
	time.Sleep(3 * time.Second)

	router.Publish(msg.MessageEventChatMessages, msg.Message{
		Type: string(msg.MesssageTypeCreate),
		Contents: db.Message{
			SenderID: 1,
			RoomID: 1,
			Contents: "Test message was succesfully sent",
		},
	})
}
