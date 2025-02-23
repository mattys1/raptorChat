package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/coder/websocket"
)

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: true,
	})

	if err != nil {
		log.Printf("WebSocket connection failed: %v", err)
		return
	}

	defer conn.Close(websocket.StatusInternalError, "Connection closing")

	log.Println("Client connected!")

	ctx, cancel := context.WithTimeout(r.Context(), time.Hour)
	defer cancel()

	coolCounter := 0

	for {
		messageType, messageContents, err := conn.Read(ctx)

		if err != nil {
			log.Println("Client disconnected:", err)
			break
		}

		if(messageType == websocket.MessageText && string(messageContents) == "button-pressed") {
			conn.Write(ctx, websocket.MessageText, []byte(strconv.Itoa(coolCounter)))
			fmt.Println("Button pressed!")
		}

		fmt.Println("Message type:", messageType)
		fmt.Println("Message contents:", string(messageContents))

		fmt.Println("Cool counter: ", coolCounter); coolCounter++
	}

	// Clean close
	conn.Close(websocket.StatusNormalClosure, "")
}

func main() {
	http.HandleFunc("/ws", wsHandler)

	log.Println("Starting server on :8080")
	err := http.ListenAndServe(":8080", nil)

	if err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
