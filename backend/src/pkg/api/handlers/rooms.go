package handlers

import (
	"fmt"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/mattys1/raptorChat/src/pkg/api"
	"github.com/mattys1/raptorChat/src/pkg/db"
)

func GetMessagesOfRoomHandler(w http.ResponseWriter, r *http.Request) {
	roomid, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid room ID", http.StatusBadRequest)
		return
	}

	dao := db.GetDao()
	messages, err := dao.GetMessagesByRoom(r.Context(), uint64(roomid))	
	if err != nil {
		http.Error(w, fmt.Sprintf("Internal Server Error, couldn't retrieve messages of id: %d", roomid), http.StatusInternalServerError)
	}

	err = api.SendResource[[]db.Message](&messages, []db.Message{}, w)
	if err != nil {
		slog.Error("Error sending messages of room", "roomid", roomid, "error", err)
	}
}
