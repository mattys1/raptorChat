package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/mattys1/raptorChat/src/pkg/db"
	appmw "github.com/mattys1/raptorChat/src/pkg/middleware"
)

func DesignateModeratorHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	dao := db.GetDao()

	roomID, _ := strconv.ParseUint(chi.URLParam(r, "id"), 10, 64)
	targetID, _ := strconv.ParseUint(chi.URLParam(r, "userID"), 10, 64)

	callerID, ok := appmw.RetrieveUserIDFromContext(ctx)
	if !ok {
		http.Error(w, "unauthorised", http.StatusUnauthorized)
		return
	}

	room, err := dao.GetRoomById(ctx, roomID)
	if err != nil || room.OwnerID == nil || *room.OwnerID != callerID {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	role, err := dao.GetRoleByName(ctx, "moderator")
	if err != nil {
		http.Error(w, "role lookup failed", http.StatusInternalServerError)
		return
	}

	err = dao.AssignRoleToUserInRoom(ctx, db.AssignRoleToUserInRoomParams{
		RoomID: roomID,
		UserID: targetID,
		RoleID: role.ID,
	})
	if err != nil {
		http.Error(w, "db error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(map[string]string{"status": "moderator added"})
}

func GetMyRolesHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	dao := db.GetDao()

	roomID, _ := strconv.ParseUint(chi.URLParam(r, "id"), 10, 64)

	userID, ok := appmw.RetrieveUserIDFromContext(ctx)
	if !ok {
		http.Error(w, "unauthorised", http.StatusUnauthorized)
		return
	}

	roles, err := dao.GetRolesByUserInRoom(ctx, db.GetRolesByUserInRoomParams{
		UserID: userID,
		RoomID: roomID,
	})
	if err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}

	names := make([]string, len(roles))
	for i, r := range roles {
		names[i] = r.Name
	}

	_ = json.NewEncoder(w).Encode(names)
}
