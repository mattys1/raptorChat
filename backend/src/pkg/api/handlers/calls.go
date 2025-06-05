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
