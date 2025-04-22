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

	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		auth.LoginHandler(w, r)

		err := client.Publish(context.Background(), "test", []byte(`{"text": "Hello from Go!"}`))
		if err != nil {
			log.Fatal("Publish error:", err)
		}
		log.Println("Message published!")
	})
	// Publish a message to channel "chat:demo"

	http.ListenAndServe(":8080", nil)
}
