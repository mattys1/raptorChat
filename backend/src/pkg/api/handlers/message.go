package handlers

import (
	"net/http"

	"github.com/mattys1/raptorChat/src/pkg/db"
	"github.com/mattys1/raptorChat/src/pkg/messaging"
)

// @Summary Delete a message
// @Description Deletes a message by ID and notifies all subscribers through Centrifugo
// @Tags messages
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param resource body messaging.EventResource true "Message resource with ID to delete"
// @Success 200 {string} string "Message deleted successfully"
// @Failure 400 {object} ErrorResponse "Error unmarshalling request body"
// @Failure 500 {object} ErrorResponse "Error deleting message"
// @Router /messages/{id} [delete]
func DeleteMessageHandler(w http.ResponseWriter, r *http.Request) {
	resource, err := messaging.GetEventResourceFromRequest(r)
	if err != nil {
		http.Error(w, "Error unmarshalling request body into messaging.EventResource", http.StatusBadRequest)
		return
	}
	message, err := messaging.GetEventResourceContents[db.Message](resource)
	if err != nil {
		http.Error(w, "Error unmarshalling request body into messaging.EventResource", http.StatusBadRequest)
		return
	}

	dao := db.GetDao()
	err = dao.DeleteMessage(r.Context(), message.ID)
	if err != nil {
		http.Error(w, "Error deleting message", http.StatusInternalServerError)
		return
	}

	message.Contents = ""
	newResource, err := messaging.ReassembleResource(resource, message)
	messaging.GetCentrifugoService().Publish(r.Context(), newResource)	
}
