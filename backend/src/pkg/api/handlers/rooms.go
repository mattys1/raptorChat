package handlers

import (
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/db"
	"github.com/mattys1/raptorChat/src/pkg/messaging"
	"github.com/mattys1/raptorChat/src/pkg/middleware"
	"github.com/segmentio/encoding/json"
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

	err = SendResource[[]db.Message](messages, w)
	if err != nil {
		slog.Error("Error sending messages of room", "roomid", roomid, "error", err)
	}
}

func SendMessageHandler(w http.ResponseWriter, r *http.Request) {
	dao := db.GetDao()

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var eventResource messaging.EventResource	
	err = json.Unmarshal(body, &eventResource)
	if err != nil {
		http.Error(w, "Error unmarshalling request body into messaging.EventResource", http.StatusBadRequest)
	}

	message, err := messaging.GetEventResourceContents[db.Message](&eventResource)
	if err != nil {
		http.Error(w, "Error unmarshalling request body into messaging.EventResource", http.StatusBadRequest)
		return
	}

	senderID, ok := middleware.RetrieveUserIDFromContext(r.Context())	
	if !ok {
		http.Error(w, "User ID not found in context", http.StatusInternalServerError)
		return
	}

	message.SenderID = senderID
	newMessageIdx, err := dao.CreateMessage(r.Context(), db.CreateMessageParams{
		SenderID: message.SenderID,
		RoomID:   message.RoomID,
		Contents: message.Contents,
	})
	if err != nil {
		slog.Error("Error creating message", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	id, err := newMessageIdx.LastInsertId()
	assert.That(err == nil, "Error getting last insert ID from just inserted message", err)
	newMessage, err := dao.GetMessageById(r.Context(), uint64(id))
	if err != nil {
		slog.Error("Error getting message by ID", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	newResource, err := messaging.ReassembleResource(&eventResource, newMessage)
	if err != nil {
		slog.Error("Error reassembling resource", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = messaging.GetCentrifugoService().Publish(
		r.Context(),
		fmt.Sprintf("room:%d", message.RoomID),
		newResource,
	)
	if err != nil {
		slog.Error("Error publishing message to Centrifugo", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	// assert.That(err == nil, "Error publishing message to Centrifugo", err)

	w.WriteHeader(http.StatusCreated)
}

func GetUsersOfRoomHandler(w http.ResponseWriter, r *http.Request, ) {
	roomid, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid room ID", http.StatusBadRequest)
		return
	}

	dao := db.GetDao()
	users, err := dao.GetUsersByRoom(r.Context(), uint64(roomid))
	if err != nil {
		http.Error(w, fmt.Sprintf("Internal Server Error, couldn't retrieve users of id: %d", roomid), http.StatusInternalServerError)
	}

	err = SendResource(users, w)
	if err != nil {
		slog.Error("Error sending users of room", "roomid", roomid, "error", err)
	}

}

func CreateRoomHandler(w http.ResponseWriter, r *http.Request) {
	dao := db.GetDao()

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var room db.Room
	err = json.Unmarshal(body, &room)
	if err != nil {
		http.Error(w, "Error unmarshalling request body into db.Room", http.StatusBadRequest)
		return
	}

	roomID, err := dao.CreateRoom(r.Context(), db.CreateRoomParams{
		Name: room.Name,
		OwnerID: room.OwnerID,
		Type: room.Type,
	})

	if err != nil {
		slog.Error("Error creating room", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	err = SendResource(roomID, w)
	if err != nil {
		slog.Error("Error sending room ID", "error", err)
	}
}
