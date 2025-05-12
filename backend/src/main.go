package main

import (
	"log"
	"net/http"

	"github.com/mattys1/raptorChat/src/pkg/api"
)

func main() {
	// Initialize Centrifugo client
	router := api.Router()

	log.Println("Starting server on :8080...")
	http.ListenAndServe(":8080", router)
}
