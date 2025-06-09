package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"fmt"
	"slices"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/messaging"
	"github.com/mattys1/raptorChat/src/pkg/middleware"
	"github.com/mattys1/raptorChat/src/pkg/orm"
)

// @Summary Get calls for a specific room
// @Description Returns all calls associated with the specified room
// @Tags calls
// @Accept json
// @Produce json
// @Param id path int true "Room ID"
// @Success 200 {array} orm.Call "List of calls for the room"
// @Failure 400 {object} string "Bad request - invalid room ID"
// @Router /rooms/{id}/calls [get]
func GetCallsOfRoomHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Couldnt read room id from request", http.StatusBadRequest)
	}

	calls, err := orm.GetCallsByRoomID(r.Context(), uint64(id))

	SendResource(calls, w)
}

// @Summary Join or create a call in a room
// @Description Joins an existing active call in the room or creates a new one if none exists
// @Tags calls
// @Accept json
// @Produce json
// @Param id path int true "Room ID"
// @Success 200 {object} orm.Call "Successfully joined or created call"
// @Failure 400 {object} string "Bad request - invalid room ID"
// @Failure 500 {object} string "Internal server error"
// @Security ApiKeyAuth
// @Router /rooms/{id}/calls/join [post]
func JoinOrCreateCallHandler(w http.ResponseWriter, r *http.Request) {
	roomID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Could not read room ID from request", http.StatusBadRequest)
		return
	}

	userID, ok := middleware.RetrieveUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User ID not found in context", http.StatusInternalServerError)
		return
	}

	calls, err := orm.GetCallsByRoomID(r.Context(), uint64(roomID))
	if err != nil {
		slog.Error("Error fetching calls for room", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	slog.Info("Calls for room", "roomID", roomID, "calls", calls, "callsCount", len(calls))

	activeCalls := slices.DeleteFunc(calls, func(call orm.Call) bool {
		return call.Status != orm.CallsStatusActive
	})
	assert.That(len(activeCalls) <= 1, "There should be at most one active call for a room", nil)

	slog.Info("Active calls for room", "roomID", roomID, "calls", activeCalls, "activeCallsCount", len(activeCalls))

	if(len(activeCalls) == 0) {
		call, err := orm.CreateCall(r.Context(), &orm.Call{
			RoomID: uint64(roomID),
			Status: orm.CallsStatusActive,
			Participants: []orm.CallParticipant{
				{ UserID: userID },
			},
		})
		if err != nil {
			slog.Error("Error creating call", "error", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		callJson, err := json.Marshal(call)
		if err != nil {
			slog.Error("Error marshalling call", "error", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		messaging.GetCentrifugoService().Publish(
			r.Context(),
			&messaging.EventResource{
				Channel: "room:" + strconv.Itoa(roomID),
				Method: "POST",
				EventName: "call_created",
				Contents: callJson,
			},
		)
	} else {
		orm.AddUserToCall(r.Context(), activeCalls[0].ID, uint64(userID))
	}
}

// @Summary Leave or end a call in a room
// @Description User leaves the active call in the room; call is ended if this is the last participant
// @Tags calls
// @Accept json
// @Produce json
// @Param id path int true "Room ID"
// @Success 200 {object} string "Successfully left the call"
// @Failure 400 {object} string "Bad request - invalid room ID"
// @Failure 500 {object} string "Internal server error"
// @Security ApiKeyAuth
// @Router /rooms/{id}/calls/leave [post]
func LeaveOrEndCallHandler(w http.ResponseWriter, r *http.Request) {
	roomID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Could not read room ID from request", http.StatusBadRequest)
		return
	}

	userID, ok := middleware.RetrieveUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User ID not found in context", http.StatusInternalServerError)
		return
	}

	calls, err := orm.GetCallsByRoomID(r.Context(), uint64(roomID))
	if err != nil {
		slog.Error("Error fetching calls for room", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	slog.Info("Calls for room", "roomID", roomID, "calls", calls, "callsCount", len(calls))

	activeCalls := slices.DeleteFunc(calls, func(call orm.Call) bool {
		return call.Status != orm.CallsStatusActive
	})

	if len(activeCalls) == 0 {
		http.Error(w, "No active call found for this room", http.StatusInternalServerError)
		return
	}

	assert.That(len(activeCalls) == 1, "There should be exactly one active call for the user in this room", nil)
	call := activeCalls[0]

	orm.RemoveUserFromCall(r.Context(), call.ID, uint64(userID))
	if call.ParticipantCount == 1 {
		updatedCall, err := orm.CompleteCall(r.Context(), call.ID)
		if err != nil {
			slog.Error("Error completing call", "error", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		updateCallJson, err := json.Marshal(updatedCall)
		if err != nil {
			slog.Error("Error marshalling call", "error", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		messaging.GetCentrifugoService().Publish(
			r.Context(),
			&messaging.EventResource{
				Channel: "room:" + strconv.Itoa(roomID),
				Method: "POST",
				EventName: "call_completed",
				Contents: updateCallJson,
			},
		)
	}
}

func RequestCallHandler(w http.ResponseWriter, r *http.Request) {
  idStr := chi.URLParam(r, "id")
  roomID, err := strconv.Atoi(idStr)
  if err != nil {
    http.Error(w, "Invalid room ID", http.StatusBadRequest)
    return
  }

  callerID, ok := middleware.RetrieveUserIDFromContext(r.Context())
  if !ok {
    http.Error(w, "Unauthorized", http.StatusUnauthorized)
    return
  }

  // create call in pending state
  call := &orm.Call{RoomID: uint64(roomID), Status: orm.CallsStatusPending}  // modified
  created, err := orm.CreateCall(r.Context(), call)
  if err != nil {
    http.Error(w, "Could not create call", http.StatusInternalServerError)
    return
  }
  _ = orm.AddUserToCall(r.Context(), created.ID, callerID)  // added

  // find other user in DM room
  room, err := orm.GetRoomByID(r.Context(), uint64(roomID))  // added
  if err != nil {
    http.Error(w, "Room not found", http.StatusNotFound)
    return
  }
  var calleeID uint64
  for _, u := range room.Users {
    if u.UserID != callerID {
      calleeID = u.UserID
      break
    }
  }

  // notify callee only
  payload := map[string]any{"id": created.ID, "room_id": created.RoomID, "issuer_id": callerID}
  data, _ := json.Marshal(payload)
  messaging.GetCentrifugoService().Publish(r.Context(), &messaging.EventResource{
    Channel:   fmt.Sprintf("user:%d", calleeID),  // modified
    Method:    "POST",
    EventName: "call_requested",
    Contents:  data,
  })

  w.Header().Set("Content-Type", "application/json")
  w.Write(data)
}

// AcceptCallHandler transitions a call from pending to active
func AcceptCallHandler(w http.ResponseWriter, r *http.Request) {
  roomID, _ := strconv.Atoi(chi.URLParam(r, "id"))
  callID, _ := strconv.Atoi(chi.URLParam(r, "callID"))

  calleeID, ok := middleware.RetrieveUserIDFromContext(r.Context())
  if !ok {
    http.Error(w, "Unauthorized", http.StatusUnauthorized)
    return
  }

  _ = orm.AddUserToCall(r.Context(), uint64(callID), calleeID)  // added
  orm.GetORM().WithContext(r.Context()).Model(&orm.Call{}).
    Where("id = ?", callID).
    Update("status", orm.CallsStatusActive)  // modified

  // broadcast start to room channel
  payload := map[string]any{"id": callID, "room_id": roomID, "issuer_id": calleeID}
  data, _ := json.Marshal(payload)
  messaging.GetCentrifugoService().Publish(r.Context(), &messaging.EventResource{
    Channel:   fmt.Sprintf("room:%d", roomID),  // modified
    Method:    "POST",
    EventName: "call_started",
    Contents:  data,
  })

  w.Header().Set("Content-Type", "application/json")
  w.Write(data)
}

// RejectCallHandler rejects a pending call and notifies caller
func RejectCallHandler(w http.ResponseWriter, r *http.Request) {
  roomID, _ := strconv.Atoi(chi.URLParam(r, "id"))
  callID, _ := strconv.Atoi(chi.URLParam(r, "callID"))

  calleeID, ok := middleware.RetrieveUserIDFromContext(r.Context())
  if !ok {
    http.Error(w, "Unauthorized", http.StatusUnauthorized)
    return
  }

  orm.GetORM().WithContext(r.Context()).Model(&orm.Call{}).
    Where("id = ?", callID).
    Update("status", orm.CallsStatusRejected)  // modified

  call, err := orm.GetCallWithParticipants(r.Context(), uint64(callID))  // added
  if err != nil || len(call.Participants) == 0 {
    http.Error(w, "Call not found", http.StatusNotFound)
    return
  }
  callerID := call.Participants[0].UserID

  payload := map[string]any{"id": callID, "room_id": roomID, "issuer_id": calleeID}
  data, _ := json.Marshal(payload)
  messaging.GetCentrifugoService().Publish(r.Context(), &messaging.EventResource{
    Channel:   fmt.Sprintf("user:%d", callerID),  // modified
    Method:    "POST",
    EventName: "call_rejected",
    Contents:  data,
  })

  w.Header().Set("Content-Type", "application/json")
  w.Write(data)
}
