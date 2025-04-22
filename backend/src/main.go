package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/centrifugal/gocent"
	"github.com/mattys1/raptorChat/src/pkg/auth"
)

func main() {
	http.HandleFunc("/login", auth.LoginHandler)
	// Initialize Centrifugo client
	var addr string
	if os.Getenv("IS_DOCKER") == "1" {
		addr = "http://centrifugo:8000/api" // Docker container address
	} else {
		addr = "http://localhost:8000/api" // Localhost address
	}
	cfg := gocent.Config{
		Addr: addr,  // Centrifugo API endpoint
		Key:  "http_secret",                 // From centrifugo.json
	}
	client := gocent.New(cfg)

	// Publish a message to channel "chat:demo"
	err := client.Publish(context.Background(), "test", []byte(`{"text": "Hello from Go!"}`))
	if err != nil {
		log.Fatal("Publish error:", err)
	}
	log.Println("Message published!")

	http.ListenAndServe(":8080", nil)
}
