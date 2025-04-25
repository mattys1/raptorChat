package api

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/k0kubun/pp"
)

func SendResource[T any](resource *T, defaultIfNull T, w http.ResponseWriter) error {
	send := defaultIfNull 
	if resource != nil {
		send = *resource
	}

	payload, err := json.Marshal(resource)
	if err != nil {
		slog.Error("Error marshalling", "resource", send, "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return err
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(payload)

	pp.Println("Sent resource", send)

	return nil
}
