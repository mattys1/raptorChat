package handlers

import (
	"log/slog"
	"net/http"

	"github.com/mattys1/raptorChat/src/pkg/db"
	"github.com/mattys1/raptorChat/src/pkg/middleware"
)

func GetRoomsOfUserHandler(w http.ResponseWriter, r *http.Request) {
	dao := db.GetDao()
	ctx := r.Context()
	uid, ok := middleware.RetrieveUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User ID not found in context", http.StatusInternalServerError)
		return
	}	

	slog.Info("User ID from context", "uid", uid)

	rooms, err := dao.GetRoomsByUser(ctx, uid)
	if err != nil {
		slog.Error("Error fetching rooms", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = SendResource[[]db.Room](&rooms, []db.Room{}, w)

	if err != nil {
		slog.Error("Error sending rooms", err)
	}
}
