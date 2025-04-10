package main

import (
	"context"
	_ "database/sql/driver"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/coder/websocket"
	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/auth"
	"github.com/mattys1/raptorChat/src/pkg/db"
	"github.com/mattys1/raptorChat/src/pkg/hub"
)

// @title raptorChat API
// @version 1.0
// @description This is a sample server for raptorChat.
// @contact.name API Support
// @contact.email support@raptorchat.io
// @host localhost:8080
// @BasePath /

// wsHandler godoc
// @Summary Upgrade HTTP connection to WebSocket
// @Description Upgrades an HTTP connection to a WebSocket connection for real-time communication.
// @Tags websocket
// @Accept json
// @Produce json
// @Success 101 {string} string "Switching Protocols"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /ws [get]
func wsHandler(w http.ResponseWriter, r *http.Request) {
	hub := hub.GetHub()
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: true,
	})
	if err != nil {
		log.Printf("WebSocket connection failed: %v", err)
		return
	}

	hub.Register <- conn
}

// protectedHandler godoc
// @Summary Access protected resource
// @Description Returns protected data for authenticated users.
// @Tags protected
// @Security ApiKeyAuth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]string "Unauthorized"
// @Router /protected [get]
func protectedHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.RetrieveUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	// Listen for messages until the connection is closed
	// for {
	// 	_, _, err := conn.Read(context.Background())
	// 	if err != nil {
	// 		log.Printf("Connection closed: %v", err)
	// 		break
	// 	}
	// }
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Protected data access granted",
		"userID":  userID,
	})
}

func main() {
	fmt.Print("Starting...")
	http.HandleFunc("/login", auth.LoginHandler)
	http.HandleFunc("/register", auth.RegisterHandler)
	http.HandleFunc("/ws", wsHandler)

	http.Handle("/protected", auth.JWTMiddleware(http.HandlerFunc(protectedHandler)))

	ctx := context.Background()

	dao := db.GetDao()
	users, err := dao.GetAllUsers(ctx)
	assert.That(err == nil, "Failed to get users", err)
	log.Println("Users:", users)

	go hub.GetHub().Run()	

	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
