package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"
	"encoding/json"

	"github.com/coder/websocket"
	"github.com/mattys1/raptorChat/src/pkg/assert"
)

var CLIENTS []*Client = []*Client{}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: true,
	})

	if err != nil {
		log.Printf("WebSocket connection failed: %v", err)
		return
	}

	defer conn.Close(websocket.StatusInternalError, "Connection closing")

	client := &Client {
		Id: 0,
		IP: r.RemoteAddr, 
		Connection: conn,
	}
	log.Println("Client connected! IP:", client.IP)

	CLIENTS = append(CLIENTS, client)

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
	http.HandleFunc("/ws", wsHandler)

	log.Println("Starting server on :8080")
	err := http.ListenAndServe(":8080", nil)

	if err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
