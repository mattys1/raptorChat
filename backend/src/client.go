package main

import (

	"github.com/coder/websocket"
	"github.com/mattys1/raptorChat/src/pkg/db"
)

type Client struct {
	User *db.User `json:"user"`
	// IP string `json:"ip"`
	Connection *websocket.Conn 
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
