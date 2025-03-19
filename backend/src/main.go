package main

import (
	"context"
	"database/sql"
	_ "database/sql/driver"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/coder/websocket"
	"github.com/go-sql-driver/mysql"
	"os"

	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/db"
)

var CLIENTS []*Client = []*Client{}
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
	http.HandleFunc("/login", loginHandler)
	http.HandleFunc("/ws", wsHandler)

	ctx := context.Background()

	cfg := mysql.NewConfig()
	cfg.User = "root"
	cfg.Passwd = os.Getenv("DB_ROOT_PASSWORD")
	cfg.Net = "tcp"
	cfg.DBName = os.Getenv("DB_NAME")
	cfg.Addr = "mysql:3306"
	cfg.Params = map[string]string{
		"parseTime": "true",
		// "ssl-verify-server-cert": "false",
	}

	rdb, err := sql.Open("mysql", cfg.FormatDSN())
	assert.That(err == nil, "Failed to connect to database")
	defer rdb.Close()

	repo := db.New(rdb)

	users, err := repo.GetAllUsers(ctx)
	assert.That(err == nil, "Failed to get users")
	log.Println("Users:", users)

	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
