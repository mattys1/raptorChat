package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/centrifugal/gocent"
	"github.com/mattys1/raptorChat/src/pkg/messaging"
)

func main() {
	// Initialize Centrifugo client
	var addr string
	if os.Getenv("IS_DOCKER") == "1" {
		addr = "http://centrifugo:8000/api"
	} else {
		addr = "http://localhost:8000/api"
	}
	cfg := gocent.Config{
		Addr: addr,  
		Key:  "http_secret",                 
	}

	client := gocent.New(cfg)

	go func() {
		time.Sleep(5 * time.Second)
		err := client.Publish(context.Background(), "test", []byte(`{"text": "Hello from Go!"}`))
		if err != nil {
			log.Fatal("Publish error:", err)
		}
		log.Println("Message published!")
	}()

	router := messaging.Router()

	log.Println("Starting server on :8080...")
	http.ListenAndServe(":8080", router)
}

