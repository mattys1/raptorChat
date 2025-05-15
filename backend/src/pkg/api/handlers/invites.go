package handlers

import (
	"encoding/json"
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
	// assert.That(invite.Type == db.InvitesTypeGroup, "Only group invites are implemented", nil)

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

	err = messaging.GetCentrifugoService().Publish(r.Context(), newResource)
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

func UpdateInviteHandler(w http.ResponseWriter, r *http.Request) {
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
	// assert.That(invite.Type == db.InvitesTypeGroup, "Only group invites are implemented", nil)

	dao := db.GetDao()

	slog.Info("UpdateInviteHandler", "Updating invite", invite)
	err = dao.UpdateInvite(r.Context(), db.UpdateInviteParams{
		State: invite.State, // for now, update only state
		ID: invite.ID,
	})
	if err != nil {
		http.Error(w, "Error updating invite", http.StatusInternalServerError)
		return
	}

	newResource, err := messaging.ReassembleResource(resource, invite)
	if err != nil {
		http.Error(w, "Error reassembling resource", http.StatusInternalServerError)
		return
	}

	err = messaging.GetCentrifugoService().Publish(r.Context(), newResource)
	if err != nil {
		slog.Error("Error publishing invite", "error", err)
		http.Error(w, "Error publishing invite", http.StatusInternalServerError)
		return
	}

	if invite.State == db.InvitesStateAccepted {
		if invite.Type == db.InvitesTypeDirect {
			dmName := fmt.Sprintf("DM: %d and %d", invite.IssuerID, invite.ReceiverID)
			dmResult, err := dao.CreateRoom(r.Context(), db.CreateRoomParams{
				Name: &dmName,
				OwnerID: nil,
				Type: db.RoomsTypeDirect,
			})
			if err != nil {
				http.Error(w, "Error creating DM room", http.StatusInternalServerError)
				return
			}

			dmID, err := dmResult.LastInsertId()
			assert.That(err == nil, "Error getting last insert ID from just inserted room", err)

			_, err = dao.CreateFriendship(r.Context(), db.CreateFriendshipParams{
				FirstID: invite.IssuerID,
				SecondID: invite.ReceiverID,
				DmID: uint64(dmID),
			})
			if err != nil {
				http.Error(w, "Error creating friendship", http.StatusInternalServerError)
				return
			}

			err = dao.AddUserToRoom(r.Context(), db.AddUserToRoomParams{
				UserID: invite.IssuerID,
				RoomID: uint64(dmID),
			})
			err = dao.AddUserToRoom(r.Context(), db.AddUserToRoomParams{
				UserID: invite.ReceiverID,
				RoomID: uint64(dmID),
			})
			if err != nil {
				http.Error(w, "Error adding user to DM room", http.StatusInternalServerError)
				return
			}

			dm, err := dao.GetRoomById(r.Context(), uint64(dmID))
			if err != nil {
				http.Error(w, "Error getting DM room by ID", http.StatusInternalServerError)
				return
			}

			dmData, err := json.Marshal(dm)
			if err != nil {
				http.Error(w, "Error marshalling room data", http.StatusInternalServerError)
				return
			}

			err = messaging.GetCentrifugoService().Publish(
				r.Context(),
				&messaging.EventResource{
					Channel: fmt.Sprintf("user:%d:rooms", invite.IssuerID),
					Method: "POST",
					EventName: "joined_room",
					Contents: dmData,
				},
			)

			err = messaging.GetCentrifugoService().Publish(
				r.Context(),
				&messaging.EventResource{
					Channel: fmt.Sprintf("user:%d:rooms", invite.ReceiverID),
					Method: "POST",
					EventName: "joined_room",
					Contents: dmData,
				},
			)
		} else {
			err := dao.AddUserToRoom(r.Context(), db.AddUserToRoomParams{
				UserID: invite.ReceiverID,
				RoomID: *invite.RoomID,
			})
			if err != nil {
				http.Error(w, "Error adding user to room", http.StatusInternalServerError)
				return
			}

			room, err := dao.GetRoomById(r.Context(), *invite.RoomID)
			if err != nil {
				http.Error(w, "Error getting room by ID", http.StatusInternalServerError)
				return
			}

			roomData, err := json.Marshal(room)
			if err != nil {
				http.Error(w, "Error marshalling room data", http.StatusInternalServerError)
				return
			}

			err = messaging.GetCentrifugoService().Publish(
				r.Context(),
				&messaging.EventResource{
					Channel: fmt.Sprintf("user:%d:rooms", invite.ReceiverID),
					Method: "POST",
					EventName: "joined_room",
					Contents: roomData,
				},
				)

			err = messaging.GetCentrifugoService().Publish(
				r.Context(),
				&messaging.EventResource{
					Channel: fmt.Sprintf("room:%d", *invite.RoomID),
					Method: "POST",
					EventName: "user_joined",
					Contents: roomData, // maybe hacky, doesn't really matter what we send
				},
			)
		}
	}

	err = SendResource(invite, w)
	if err != nil {
		slog.Error("Error sending invite response", "error", err)
		return
	}
}
