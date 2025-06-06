package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"slices"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/messaging"
	"github.com/mattys1/raptorChat/src/pkg/middleware"
	"github.com/mattys1/raptorChat/src/pkg/orm"
)

func RequestCallHandler(w http.ResponseWriter, r *http.Request) {
	// Parse room ID from URL
	roomIDStr := chi.URLParam(r, "id")
	roomID, err := strconv.Atoi(roomIDStr)
	if err != nil {
		http.Error(w, "Invalid room ID", http.StatusBadRequest)
		return
	}
	// Get caller's user ID from JWT context
	userID, ok := middleware.RetrieveUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	// Build a small payload struct for the event:
	type callRequestPayload struct {
		CallerID uint64 `json:"caller_id"`
	}
	payload := callRequestPayload{CallerID: userID}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		http.Error(w, "Failed to serialize payload", http.StatusInternalServerError)
		return
	}

	// Assemble the EventResource that CentrifugoService expects:
	eventResource := &messaging.EventResource{
		Channel:   "room:" + strconv.Itoa(roomID),
		Method:    "POST",
		EventName: "call_request",
		Contents:  payloadBytes,
	}
	// Publish it:
	err = messaging.GetCentrifugoService().Publish(r.Context(), eventResource)
	if err != nil {
		http.Error(w, "Failed to publish call_request", http.StatusInternalServerError)
		return
	}
	// 200 OK, no body needed
	w.WriteHeader(http.StatusOK)
}

// RejectCallRequestHandler publishes a "call_rejected" event to the given room's Centrifugo channel.
// This is called if the callee rejects before actually accepting/joining.
func RejectCallRequestHandler(w http.ResponseWriter, r *http.Request) {
	// Parse room ID from URL
	roomIDStr := chi.URLParam(r, "id")
	roomID, err := strconv.Atoi(roomIDStr)
	if err != nil {
		http.Error(w, "Invalid room ID", http.StatusBadRequest)
		return
	}
	// Optionally, we could record who rejected, but for now the caller just needs the notification.
	type rejectPayload struct {
		Message string `json:"message"`
	}
	payload := rejectPayload{Message: "User rejected the call."}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		http.Error(w, "Failed to serialize payload", http.StatusInternalServerError)
		return
	}

	eventResource := &messaging.EventResource{
		Channel:   "room:" + strconv.Itoa(roomID),
		Method:    "POST",
		EventName: "call_rejected",
		Contents:  payloadBytes,
	}
	err = messaging.GetCentrifugoService().Publish(r.Context(), eventResource)
	if err != nil {
		http.Error(w, "Failed to publish call_rejected", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func GetCallsOfRoomHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Couldnt read room id from request", http.StatusBadRequest)
	}

	calls, err := orm.GetCallsByRoomID(r.Context(), uint64(id))

	SendResource(calls, w)
}

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
