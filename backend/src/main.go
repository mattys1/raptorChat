package main

import (
	"context"
	_ "database/sql/driver"
	"fmt"
	"log"
	"net/http"

	"github.com/coder/websocket"

	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/auth"
	"github.com/mattys1/raptorChat/src/pkg/db"
)

func wsHandler(w http.ResponseWriter, r *http.Request) {
	hub := GetHub()
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: true,
	})
	if err != nil {
		log.Printf("WebSocket connection failed: %v", err)
		return
	}

	hub.Register <- conn

	// Listen for messages until the connection is closed
	// for {
	// 	_, _, err := conn.Read(context.Background())
	// 	if err != nil {
	// 		log.Printf("Connection closed: %v", err)
	// 		break
	// 	}
	// }
}

func main() {
	fmt.Print("Starting...")
	http.HandleFunc("/login", auth.LoginHandler)
	http.HandleFunc("/ws", wsHandler)

	ctx := context.Background()

	dao := db.GetDao()

	users, err := dao.GetAllUsers(ctx)
	assert.That(err == nil, "Failed to get users", err)
	log.Println("Users:", users)

	// assert.That(false, "")

	go GetHub().run()	

	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
