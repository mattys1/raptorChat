package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/mattys1/raptorChat/src/pkg/messaging"
	"github.com/mattys1/raptorChat/src/pkg/middleware"
	"github.com/mattys1/raptorChat/src/pkg/orm"
)

// POST /rooms/{id}/calls/request
// Sends a Centrifugo “incoming_call” event to the other user in a DM room.
func RequestCallHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	roomID, _ := strconv.Atoi(chi.URLParam(r, "id"))
	callerID, _ := middleware.RetrieveUserIDFromContext(ctx)

	// ensure DM room ----------------------------------------------------------
	var room orm.Room
	if err := orm.GetORM().WithContext(ctx).First(&room, uint64(roomID)).Error; err != nil {
		http.Error(w, "room not found", http.StatusNotFound)
		return
	}
	if room.Type != orm.RoomsTypeDirect {
		http.Error(w, "not a direct room", http.StatusBadRequest)
		return
	}

	// pick the callee ---------------------------------------------------------
	var links []orm.UsersRoom
	orm.GetORM().WithContext(ctx).Where("room_id = ?", roomID).Find(&links)

	var calleeID uint64
	for _, l := range links {
		if l.UserID != uint64(callerID) {
			calleeID = l.UserID
			break
		}
	}
	if calleeID == 0 {
		http.Error(w, "callee not found", http.StatusInternalServerError)
		return
	}

	// caller username for nicer popup
	var caller orm.User
	orm.GetORM().WithContext(ctx).First(&caller, callerID)

	payload, _ := json.Marshal(map[string]any{
		"room_id":         roomID,
		"caller_id":       callerID,
		"caller_username": caller.Username,
	})

	messaging.GetCentrifugoService().Publish(ctx, &messaging.EventResource{
		Channel:   fmt.Sprintf("user:%d:calls", calleeID),
		Method:    http.MethodPost,
		EventName: "incoming_call",
		Contents:  payload,
	})

	w.WriteHeader(http.StatusOK)
}

// POST /rooms/{id}/calls/reject
// Notifies the caller that the callee said “no”.
func RejectCallHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	roomID, _ := strconv.Atoi(chi.URLParam(r, "id"))
	userID, _ := middleware.RetrieveUserIDFromContext(ctx)

	var links []orm.UsersRoom
	orm.GetORM().WithContext(ctx).Where("room_id = ?", roomID).Find(&links)

	var other uint64
	for _, l := range links {
		if l.UserID != uint64(userID) {
			other = l.UserID
			break
		}
	}
	if other == 0 {
		http.Error(w, "caller not found", http.StatusInternalServerError)
		return
	}

	body, _ := json.Marshal(map[string]any{ "room_id": roomID })

	messaging.GetCentrifugoService().Publish(ctx, &messaging.EventResource{
		Channel:   fmt.Sprintf("user:%d:calls", other),
		Method:    http.MethodPost,
		EventName: "call_rejected",
		Contents:  body,
	})
	w.WriteHeader(http.StatusOK)
}