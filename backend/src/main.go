package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/coder/websocket"
)

func enableCors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
}

type LoginCredentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(w)

	if r.Method == http.MethodOptions {
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var creds LoginCredentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	time.Sleep(1 * time.Second)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "success"}`))
}

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

		if messageType == websocket.MessageText && string(messageContents) == "button-pressed" {
			coolCounter++
			conn.Write(ctx, websocket.MessageText, []byte(strconv.Itoa(coolCounter)))
			fmt.Println("Button pressed!")
		}

		fmt.Println("Message type:", messageType)
		fmt.Println("Message contents:", string(messageContents))
		fmt.Println("Cool counter:", coolCounter)
	}

	conn.Close(websocket.StatusNormalClosure, "")
}

func main() {
	http.HandleFunc("/login", loginHandler)
	http.HandleFunc("/ws", wsHandler)

	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
