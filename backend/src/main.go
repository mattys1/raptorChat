// @title        RaptorChat API
// @version      1.0
// @description  This is the API server for RaptorChat.
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@raptorchat.example.com

// @host      localhost:8080
// @BasePath  /api/v1

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
