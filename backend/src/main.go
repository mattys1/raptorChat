package main

import (
	"context"
	_ "database/sql/driver"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/coder/websocket"

	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/auth"
	"github.com/mattys1/raptorChat/src/pkg/db"
)

var CLIENTS []*Client = []*Client{}
var HUB *Hub = newHub()

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: true,
	})
	if err != nil {
		log.Printf("WebSocket connection failed: %v", err)
		return
	}
	defer func() {
		HUB.unregister <- CLIENTS[len(CLIENTS) - 1]
		conn.Close(websocket.StatusInternalError, "Connection closing")
	}()

	client := &Client {
		IP: r.RemoteAddr, 
		Connection: conn,
	}
	log.Println("Client connected! IP:", client.IP)

	CLIENTS = append(CLIENTS, client)

	HUB.register <- client	

	ctx, cancel := context.WithTimeout(r.Context(), time.Hour)
	defer cancel()

	coolCounter := 0

	for {
		messageType, messageContents, err := conn.Read(ctx)
		if err != nil {
			log.Println("Client disconnected:", err)
			break
		}

		assert.That(messageType == websocket.MessageText, "Not implemented, probably shouldn't even be handled")

		message := string(messageContents)
		switch message {
		case "button-pressed":
			coolCounter++
			conn.Write(ctx, websocket.MessageText, []byte(strconv.Itoa(coolCounter)))
			fmt.Println("Button pressed")

		default: 
			log.Default().Println("New message:", message)

			encoded, err := json.Marshal(
				Message {
					Sender: client,
					Content: message,
				},
			)
			assert.That(err == nil, "Failed to encode message")

			for _, client := range CLIENTS {
				client.Connection.Write(ctx, websocket.MessageText, encoded)
			}

			log.Println("Sent:", string(encoded))
			
		}

		fmt.Println("Cool counter: ", coolCounter);
	}

	conn.Close(websocket.StatusNormalClosure, "")
}

func main() {
	fmt.Print("Starting...")
	http.HandleFunc("/login", auth.LoginHandler)
	http.HandleFunc("/ws", wsHandler)

	ctx := context.Background()

	dao := db.GetDao()

	users, err := dao.GetAllUsers(ctx)
	assert.That(err == nil, "Failed to get users")
	log.Println("Users:", users)

	// assert.That(false, "")

	go HUB.run()	

	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
