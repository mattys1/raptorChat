package handlers

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"slices"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/db"
	"github.com/mattys1/raptorChat/src/pkg/messaging"
	"github.com/mattys1/raptorChat/src/pkg/middleware"
)

// @Summary Get messages from a specific room
// @Description Retrieves all non-deleted messages from a specified room
// @Tags rooms,messages
// @Accept json
// @Produce json
// @Param id path int true "Room ID"
// @Success 200 {array} db.Message "List of messages"
// @Failure 400 {string} string "Invalid room ID"
// @Failure 500 {string} string "Internal Server Error"
// @Router /rooms/{id}/messages [get]
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

	err = SendResource(slices.DeleteFunc(messages, func(message db.Message) bool { return *message.IsDeleted == true }), w)
	if err != nil {
		slog.Error("Error sending messages of room", "roomid", roomid, "error", err)
	}
}

// @Summary Send a message to a room
// @Description Creates a new message in the specified room and publishes it via Centrifugo
// @Tags rooms,messages
// @Accept json
// @Produce json
// @Param message body messaging.EventResource true "Message event resource"
// @Success 201 {string} string "Created"
// @Failure 400 {string} string "Error unmarshalling request body"
// @Failure 500 {string} string "Internal Server Error"
// @Router /rooms/messages [post]
func SendMessageHandler(w http.ResponseWriter, r *http.Request) {
	dao := db.GetDao()

	eventResource, err := messaging.GetEventResourceFromRequest(r)
	if err != nil {
		http.Error(w, "Error unmarshalling request body into messaging.EventResource", http.StatusBadRequest)
	}

	message, err := messaging.GetEventResourceContents[db.Message](eventResource)
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

	newResource, err := messaging.ReassembleResource(eventResource, newMessage)
	if err != nil {
		slog.Error("Error reassembling resource", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = messaging.GetCentrifugoService().Publish(
		r.Context(),
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

// @Summary Get users in a room
// @Description Retrieves all users that are members of the specified room
// @Tags rooms,users
// @Accept json
// @Produce json
// @Param id path int true "Room ID"
// @Success 200 {array} db.User "List of users"
// @Failure 400 {string} string "Invalid room ID"
// @Failure 500 {string} string "Internal Server Error"
// @Router /rooms/{id}/users [get]
func GetUsersOfRoomHandler(w http.ResponseWriter, r *http.Request) {
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

// @Summary Create a new room
// @Description Creates a new chat room and assigns the creator as owner with appropriate permissions
// @Tags rooms
// @Accept json
// @Produce json
// @Param room body messaging.EventResource true "Room event resource"
// @Success 201 {object} messaging.EventResource "Created room"
// @Failure 400 {string} string "Error unmarshalling request body"
// @Failure 500 {string} string "Internal Server Error"
// @Router /rooms [post]
func CreateRoomHandler(w http.ResponseWriter, r *http.Request) {
	dao := db.GetDao()

	eventResource, err := messaging.GetEventResourceFromRequest(r)
	if err != nil {
		http.Error(w, "Error unmarshalling EventResource", http.StatusBadRequest)
		return
	}

	room, err := messaging.GetEventResourceContents[db.Room](eventResource)
	if err != nil {
		http.Error(w, "Error unmarshalling room contents", http.StatusBadRequest)
		return
	}

	res, err := dao.CreateRoom(r.Context(), db.CreateRoomParams{
		Name:    room.Name,
		OwnerID: room.OwnerID,
		Type:    room.Type,
	})
	if err != nil {
		http.Error(w, "Internal Server Error:" + err.Error(), http.StatusInternalServerError)
		return
	}
	roomID, _ := res.LastInsertId()

	_ = dao.AddUserToRoom(r.Context(), db.AddUserToRoomParams{
		UserID: *room.OwnerID,
		RoomID: uint64(roomID),
	})

	if ownerRole, err := dao.GetRoleByName(r.Context(), "owner"); err == nil {
		_ = dao.AssignRoleToUserInRoom(r.Context(), db.AssignRoleToUserInRoomParams{
			RoomID: uint64(roomID),
			UserID: *room.OwnerID,
			RoleID: ownerRole.ID,
		})
	}

	newResource, _ := messaging.ReassembleResource(eventResource, db.Room{
		ID:      uint64(roomID),
		Name:    room.Name,
		OwnerID: room.OwnerID,
		Type:    room.Type,
	})

	_ = messaging.GetCentrifugoService().Publish(r.Context(), &messaging.EventResource{
		Channel:   newResource.Channel,
		Method:    newResource.Method,
		EventName: "joined_room",
		Contents:  newResource.Contents,
	})
	_ = messaging.GetCentrifugoService().Publish(r.Context(), newResource)

	w.WriteHeader(http.StatusCreated)
	_ = SendResource(newResource, w)
}

// @Summary Delete a room
// @Description Deletes a room if the requester is the owner
// @Tags rooms
// @Accept json
// @Produce json
// @Param id path int true "Room ID"
// @Param room body messaging.EventResource true "Room event resource"
// @Success 204 {string} string "No Content"
// @Failure 400 {string} string "Invalid room ID or bad request body"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden - only the owner may delete the room"
// @Failure 404 {string} string "Room not found"
// @Failure 500 {string} string "Internal Server Error"
// @Router /rooms/{id} [delete]
func DeleteRoomHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	dao := db.GetDao()

	slog.Info("DeleteRoomHandler called", "roomID", chi.URLParam(r, "id"))

	callerID, ok := middleware.RetrieveUserIDFromContext(ctx)
	if !ok {
		http.Error(w, "unauthorised", http.StatusUnauthorized)
		return
	}

	roomID, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid room id", http.StatusBadRequest)
		return
	}

	room, err := dao.GetRoomById(ctx, roomID)
	if err != nil {
		http.Error(w, "room not found", http.StatusNotFound)
		return
	}
	if room.OwnerID != nil && *room.OwnerID != callerID {
		http.Error(w, "forbidden – only the owner may delete the room", http.StatusForbidden)
		slog.Warn("User attempted to delete room they do not own", "roomID", roomID, "callerID", callerID, "ownerID", room.OwnerID)
		return
	}

	eventResource, err := messaging.GetEventResourceFromRequest(r)
	if err != nil {
		http.Error(w, "bad EventResource", http.StatusBadRequest)
		return
	}
	roomPayload, err := messaging.GetEventResourceContents[db.Room](eventResource)
	if err != nil {
		http.Error(w, "bad contents", http.StatusBadRequest)
		return
	}

	newResource, err := messaging.ReassembleResource(eventResource, room)
	if err != nil {
		slog.Error("Error reassembling resource", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = messaging.GetCentrifugoService().Publish(
		r.Context(),
		newResource,
	)

	publishToRoomMembers(*newResource, dao, r.Context())

	err = dao.DeleteRoom(r.Context(), room.ID)
	if err != nil {
		slog.Error("Error deleting room", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	_ = dao.DeleteRoom(ctx, roomPayload.ID)
	w.WriteHeader(http.StatusNoContent)
}

// @Summary Get a specific room
// @Description Retrieves details of a specific room by ID
// @Tags rooms
// @Accept json
// @Produce json
// @Param id path int true "Room ID"
// @Success 200 {object} db.Room "Room details"
// @Failure 400 {string} string "Invalid room ID"
// @Failure 500 {string} string "Internal Server Error"
// @Router /rooms/{id} [get]
func GetRoomHandler(w http.ResponseWriter, r *http.Request) {
	roomid, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid room ID", http.StatusBadRequest)
		return
	}

	dao := db.GetDao()
	room, err := dao.GetRoomById(r.Context(), uint64(roomid))
	if err != nil {
		http.Error(w, fmt.Sprintf("Internal Server Error, couldn't retrieve room of id: %d", roomid), http.StatusInternalServerError)
	}

	err = SendResource(room, w)
	if err != nil {
		slog.Error("Error sending room", "roomid", roomid, "error", err)
	}
}

// @Summary Update a room
// @Description Updates an existing room's details (only group rooms can be updated)
// @Tags rooms
// @Accept json
// @Produce json
// @Param room body messaging.EventResource true "Room event resource with updated details"
// @Success 204 {string} string "No Content"
// @Failure 400 {string} string "Error unmarshalling request body or non-group room"
// @Failure 500 {string} string "Internal Server Error"
// @Router /rooms [put]
func UpdateRoomHandler(w http.ResponseWriter, r *http.Request) {
	dao := db.GetDao()
	eventResource, err := messaging.GetEventResourceFromRequest(r)
	if err != nil {
		http.Error(w, "Error unmarshalling request body into messaging.EventResource", http.StatusBadRequest)
		return
	}

	room, err := messaging.GetEventResourceContents[db.Room](eventResource)
	if err != nil {
		http.Error(w, "Error unmarshalling request body into messaging.EventResource", http.StatusBadRequest)
		return
	}
	if room.Type != db.RoomsTypeGroup {
		http.Error(w, "Only group rooms can be updated", http.StatusBadRequest)
		return
	}

	newResource, err := messaging.ReassembleResource(eventResource, room)
	if err != nil {
		slog.Error("Error reassembling resource", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = dao.UpdateRoom(r.Context(), db.UpdateRoomParams{
		ID:      room.ID,
		Name:    room.Name,
		Type:    room.Type,
		OwnerID: room.OwnerID,
	})
	if err != nil {
		slog.Error("Error updating room", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = messaging.GetCentrifugoService().Publish(
		r.Context(),
		newResource,
	)

	publishToRoomMembers(*newResource, dao, r.Context())

	w.WriteHeader(http.StatusNoContent)
}

// @Summary Publish event to room members
// @Description Helper function to publish events to all members of a room
// @Tags internal
func publishToRoomMembers(resource messaging.EventResource, dao *db.Queries, ctx context.Context) error {
	room, err := messaging.GetEventResourceContents[db.Room](&resource)
	useresInRoom, err := dao.GetUsersByRoom(ctx, room.ID)
	if err != nil {
		slog.Error("Error getting users in room", "error", err)
		return err
	}

	// for clearing the sidbar of other room members
	for _, user := range useresInRoom {
		resource.Channel = fmt.Sprintf("user:%d:rooms", user.ID)
		err := messaging.GetCentrifugoService().Publish(
			ctx,
			&resource,
		)
		if err != nil {
			slog.Error("Error publishing to room member", "error", err)
			return err
		}
	}

	return nil
}

// @Summary Get count of messages in a room
// @Description Retrieves the count of messages in the specified room
// @Tags rooms,messages
// @Accept json
// @Produce json
// @Param id path int true "Room ID"
// @Success 200 {integer} int "Message count"
// @Failure 400 {string} string "Invalid room ID"
// @Failure 500 {string} string "Internal Server Error"
// @Router /rooms/{id}/count [get]
func GetCountOfRoomHandler(w http.ResponseWriter, r *http.Request) {
	roomid, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid room ID", http.StatusBadRequest)
		return
	}

	dao := db.GetDao()
	count, err := dao.GetCountOfRoom(r.Context(), uint64(roomid))
	if err != nil {
		http.Error(w, fmt.Sprintf("Internal Server Error, couldn't retrieve count of id: %d", roomid), http.StatusInternalServerError)
	}

	err = SendResource(count, w)
	if err != nil {
		slog.Error("Error sending count of room", "roomid", roomid, "error", err)
	}
}
