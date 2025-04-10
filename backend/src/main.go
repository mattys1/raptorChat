package main

import (
	"context"
	_ "database/sql/driver"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/coder/websocket"
	"github.com/mattys1/raptorChat/src/pkg/acl" // Import ACL package
	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/auth"
	"github.com/mattys1/raptorChat/src/pkg/db"
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
	hub := GetHub()

	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "Missing token", http.StatusUnauthorized)
		return
	}

	claims, err := auth.ValidateToken(token)
	if err != nil {
		http.Error(w, "Invalid token: "+err.Error(), http.StatusUnauthorized)
		return
	}

	user, err := db.GetDao().GetUserById(r.Context(), claims.UserID)
	if err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: true,
	})
	if err != nil {
		log.Printf("WebSocket connection failed: %v", err)
		return
	}

	client := &Client{
		User:       &user,
		Connection: conn,
	}
	hub.Register <- client
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
	claims, ok := auth.RetrieveUserClaimsFromContext(r.Context())
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Protected data access granted",
		"userID":  claims.UserID,
		"role":    claims.Role,
	})
}

// adminHandler godoc
// @Summary Access admin resource
// @Description Returns data for admin users only.
// @Tags admin
// @Security ApiKeyAuth
// @Produce plain
// @Success 200 {string} string "Welcome to the admin area!"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Router /admin [get]
func adminHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Welcome to the admin area!"))
}

func main() {
	fmt.Print("Starting...")

	http.HandleFunc("/login", auth.LoginHandler)
	http.HandleFunc("/register", auth.RegisterHandler)
	http.HandleFunc("/ws", wsHandler)

	http.Handle("/protected", auth.JWTMiddleware(http.HandlerFunc(protectedHandler)))

	enforcer := acl.NewEnforcer()
	http.Handle("/admin", auth.JWTMiddleware(acl.CasbinMiddleware(enforcer, http.HandlerFunc(adminHandler))))

	ctx := context.Background()
	dao := db.GetDao()
	users, err := dao.GetAllUsers(ctx)
	assert.That(err == nil, "Failed to get users", err)
	log.Println("Users:", users)

	go GetHub().run()

	log.Println("Server starting on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
