package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/mattys1/raptorChat/src/pkg/db"
	appmw "github.com/mattys1/raptorChat/src/pkg/middleware"
)

// @Summary Designate user as a room moderator
// @Description Assigns the moderator role to a user in a specific room
// @Tags rooms,roles,users
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param id path int true "Room ID"
// @Param userID path int true "User ID to designate as moderator"
// @Success 200 {object} map[string]string "Returns {\"status\": \"moderator added\"}"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden - only room owner can designate moderators"
// @Failure 500 {string} string "Internal server error"
// @Router /rooms/{id}/moderators/{userID} [post]
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

// @Summary Get current user's roles in a room
// @Description Returns all roles the authenticated user has in a specific room
// @Tags rooms,roles
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param id path int true "Room ID"
// @Success 200 {array} string "List of role names"
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Internal server error"
// @Router /rooms/{id}/roles [get]
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
