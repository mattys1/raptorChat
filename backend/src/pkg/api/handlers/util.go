package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

func SendResource[T any](resource T, w http.ResponseWriter) error {
	payload, err := json.Marshal(resource)
	if err != nil {
		slog.Error("Error marshalling", "resource", resource, "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return err
	}

	slog.Info("SendResource", "payload", string(payload))
	w.Header().Set("Content-Type", "application/json")
	w.Write(payload)

	return nil
}
