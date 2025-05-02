package handlers

import (
	"log/slog"
	"net/http"
	"slices"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/mattys1/raptorChat/src/pkg/db"
	"github.com/mattys1/raptorChat/src/pkg/middleware"
)

func GetRoomsOfUserHandler(w http.ResponseWriter, r *http.Request) {
	dao := db.GetDao()
	ctx := r.Context()
	uid, ok := middleware.RetrieveUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User ID not found in context", http.StatusInternalServerError)
		return
	}	

	slog.Info("User ID from context", "uid", uid)

	rooms, err := dao.GetRoomsByUser(ctx, uid)
	if err != nil {
		slog.Error("Error fetching rooms", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = SendResource[[]db.Room](rooms, w)

	if err != nil {
		slog.Error("Error sending rooms", err)
	}
}
func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	dao := db.GetDao()
	ctx := r.Context()
	uid, ok := middleware.RetrieveUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User ID not found in context", http.StatusInternalServerError)
		return
	}

	users, err := dao.GetAllUsers(ctx)
	if err != nil {
		slog.Error("Error fetching users", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	usersWithoutSender := slices.DeleteFunc(users, func (u db.User) bool {
		return u.ID == uid
	})

	err = SendResource(usersWithoutSender, w)

	if err != nil {
		slog.Error("Error sending users", err)
	}
}
func GetOwnIDHandler(w http.ResponseWriter, r *http.Request) {
	uid, ok := middleware.RetrieveUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User ID not found in context", http.StatusInternalServerError)
		return
	}

	slog.Info("User ID from context", "uid", uid)

	err := SendResource(uid, w)
	if err != nil {
		slog.Error("Error sending user", "error", err)
	}
}

// for some reason returns nil
func GetInvitesOfUserHandler(w http.ResponseWriter, r *http.Request) {
	dao := db.GetDao()
	ctx := r.Context()
	targetId, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	invites, err := dao.GetInvitesToUser(ctx, uint64(targetId))
	if err != nil {
		slog.Error("Error fetching invites", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	invites = slices.DeleteFunc(invites, func(i db.Invite) bool {
		return i.State != db.InvitesStatePending
	})

	slog.Info("Invites", "invites", invites)
	err = SendResource(invites, w)
	if err != nil {
		slog.Error("Error sending invites", "err", err.Error())
	}
	slog.Info("Sent invites", "invites", invites)
}

func GetFriendsOfUserHandler(w http.ResponseWriter, r *http.Request) {
	dao := db.GetDao()
	ctx := r.Context()
	uid, ok := middleware.RetrieveUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	friends, err := dao.GetFriendsOfUser(ctx, db.GetFriendsOfUserParams{
		UserID: uint64(uid),
	})
	if err != nil {
		slog.Error("Error fetching friends", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = SendResource(friends, w)
	if err != nil {
		slog.Error("Error sending friends", "err", err.Error())
	}
}

func GetUserHandler(w http.ResponseWriter, r *http.Request) {
	dao := db.GetDao()
	ctx := r.Context()
	targetId, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	user, err := dao.GetUserById(ctx, uint64(targetId))
	if err != nil {
		slog.Error("Error fetching user", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = SendResource(user, w)
	if err != nil {
		slog.Error("Error sending user", "err", err.Error())
	}
}
