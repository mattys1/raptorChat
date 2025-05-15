package handlers

import (
	"net/http"

	"github.com/mattys1/raptorChat/src/pkg/db"
	"github.com/mattys1/raptorChat/src/pkg/messaging"
)

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
