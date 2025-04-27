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

	var eventResource messaging.EventResource	
	err = json.Unmarshal(body, &eventResource)
	if err != nil {
		http.Error(w, "Error unmarshalling request body into messaging.EventResource", http.StatusBadRequest)
	}

	room, err := messaging.GetEventResourceContents[db.Room](&eventResource)
	if err != nil {
		http.Error(w, "Error unmarshalling request body into messaging.EventResource", http.StatusBadRequest)
		return
	}

	slog.Info("Creating room", "room", room)
	roomResult, err := dao.CreateRoom(r.Context(), db.CreateRoomParams{
		Name: room.Name,
		OwnerID: room.OwnerID,
		Type: room.Type,
	})
	if err != nil {
		slog.Error("Error creating room", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	roomID, err := roomResult.LastInsertId()
	assert.That(err == nil, "Error getting last insert ID from just inserted room", err)
	newResource, err := messaging.ReassembleResource(&eventResource, db.Room{
		ID: uint64(roomID),
		Name: room.Name,
		OwnerID: room.OwnerID,
		Type: room.Type,
	})

	err = dao.AddUserToRoom(r.Context(), db.AddUserToRoomParams{
		UserID: *room.OwnerID,
		RoomID: uint64(roomID),
	})
	if err != nil {
		slog.Error("Error adding user to room", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// FIXME: hack
	messaging.GetCentrifugoService().Publish(
		r.Context(),
		newResource.Channel,
		&messaging.EventResource{
			Channel: newResource.Channel,
			Method: newResource.Method,
			EventName: "joined_room",
			Contents: newResource.Contents,
		},
	)

	err = messaging.GetCentrifugoService().Publish(
		r.Context(),
		newResource.Channel,
		newResource,
	)

	w.WriteHeader(http.StatusCreated)
	err = SendResource(newResource, w)
	if err != nil {
		slog.Error("Error sending room ID", "error", err)
	}
}
