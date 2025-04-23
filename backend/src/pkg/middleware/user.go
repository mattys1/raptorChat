package middleware

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/mattys1/raptorChat/src/pkg/db"
)

func RoomsHandler(w http.ResponseWriter, r *http.Request) {
	dao := db.GetDao()
	ctx := r.Context()
	uid, ok := RetrieveUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User ID not found in context", http.StatusInternalServerError)
		return
	}	

	slog.Info("User ID from context", "uid", uid)

	switch r.Method {
	case http.MethodGet:
		rooms, err := dao.GetRoomsByUser(ctx, uid)
		if err != nil {
			slog.Error("Error fetching rooms", "error", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		if rooms == nil {
			slog.Warn("No rooms found for user", "uid", uid)
			rooms = []db.Room{}
		}


		payload, err := json.Marshal(rooms)
		if err != nil {
			slog.Error("Error marshalling rooms", "error", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(payload)
		slog.Info("Rooms fetched successfully", "rooms", rooms, "payload", string(payload))
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
