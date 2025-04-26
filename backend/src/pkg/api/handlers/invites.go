package handlers

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/db"
	"github.com/mattys1/raptorChat/src/pkg/messaging"
	"github.com/mattys1/raptorChat/src/pkg/middleware"
)

func CreateInviteHandler(w http.ResponseWriter, r *http.Request) {
	resource, err := messaging.GetEventResourceFromRequest(r)
	if err != nil {
		http.Error(w, "Error unmarshalling request body into messaging.EventResource", http.StatusBadRequest)
		return
	}

	invite, err := messaging.GetEventResourceContents[db.Invite](resource)
	if err != nil {
		http.Error(w, "Error unmarshalling request body into messaging.EventResource", http.StatusBadRequest)
		return
	}
	assert.That(invite.Type == db.InvitesTypeGroup, "Only group invites are implemented", nil)

	dao := db.GetDao()
	senderId, ok := middleware.RetrieveUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User ID not found in context", http.StatusInternalServerError)
		return
	}
	
	createResult, err := dao.CreateInvite(r.Context(), db.CreateInviteParams{
		Type: invite.Type,
		State: invite.State,
		RoomID: invite.RoomID,
		IssuerID: senderId,
		ReceiverID: invite.ReceiverID,
	})
	if err != nil {
		http.Error(w, "Error creating invite", http.StatusInternalServerError)
		return
	}

	inviteIdx, err := createResult.LastInsertId()
	assert.That(err == nil, "Error getting last insert id", err)
	newInvite, err := dao.GetInviteById(r.Context(), uint64(inviteIdx))
	if err != nil {
		http.Error(w, "Error getting invite by ID", http.StatusInternalServerError)
		return
	}

	newResource, err := messaging.ReassembleResource(resource, newInvite)
	if err != nil {
		http.Error(w, "Error reassembling resource", http.StatusInternalServerError)
		return
	}

	err = messaging.GetCentrifugoService().Publish(r.Context(), fmt.Sprintf("user:%d:invites", invite.ReceiverID), newResource)
	if err != nil {
		slog.Error("Error publishing invite", "error", err)
		http.Error(w, "Error publishing invite", http.StatusInternalServerError)
		return
	}
	
	err = SendResource(newInvite, w)
	if err != nil {
		slog.Error("Error sending invite response", "error", err)
		return
	}
}
