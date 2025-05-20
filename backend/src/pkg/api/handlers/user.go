package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/mattys1/raptorChat/src/pkg/db"
	"github.com/mattys1/raptorChat/src/pkg/messaging"
	"github.com/mattys1/raptorChat/src/pkg/middleware"
	"golang.org/x/crypto/bcrypt"
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

	usersWithoutSender := slices.DeleteFunc(users, func(u db.User) bool {
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

type UpdatePasswordRequest struct {
	NewPassword string `json:"new_password"`
	OldPassword string `json:"old_password"`
}

func UpdatePasswordHandler(w http.ResponseWriter, r *http.Request) {
	dao := db.GetDao()
	ctx := r.Context()
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}

	uid, ok := middleware.RetrieveUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User ID not found in context", http.StatusInternalServerError)
		return
	}

	user, err := dao.GetUserById(ctx, uint64(uid))
	if err != nil {
		slog.Error("Error fetching user", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	var update UpdatePasswordRequest
	err = json.Unmarshal(body, &update)
	if err != nil {
		http.Error(w, "Error unmarshalling request body", http.StatusBadRequest)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(update.OldPassword))
	if err != nil {
		http.Error(w, "Old password doesn't match the user password", http.StatusBadRequest)
		return
	}

	hashedNew, err := bcrypt.GenerateFromPassword([]byte(update.NewPassword), bcrypt.DefaultCost)

	if bytes.Equal(hashedNew, []byte(user.Password)) {
		http.Error(w, "New password cannot be the same as the old one", http.StatusBadRequest)
		return
	}

	err = dao.UpdateUser(ctx, db.UpdateUserParams{
		ID: user.ID,
		Username: user.Username,
		Email: user.Email,
		Password: string(hashedNew),
	})

	if err != nil {
		slog.Error("Error updating user", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}

func UpdateUsernameHandler(w http.ResponseWriter, r *http.Request) {
	dao := db.GetDao()
	ctx := r.Context()
	resource, err := messaging.GetEventResourceFromRequest(r)
	newUsername, err := messaging.GetEventResourceContents[string](resource)
	if err != nil {
		http.Error(w, "Error getting resource", http.StatusBadRequest)
		return
	}

	uid, ok := middleware.RetrieveUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User ID not found in context", http.StatusInternalServerError)
		return
	}

	user, err := dao.GetUserById(ctx, uint64(uid))
	if err != nil {
		slog.Error("Error fetching user", "error", err)
	}

	err = dao.UpdateUser(ctx, db.UpdateUserParams{
		ID: user.ID,
		Username: *newUsername,
		Email: user.Email,
		Password: user.Password,
	})
	if err != nil {
		slog.Error("Error updating user", "error", err)
	}
	messaging.GetCentrifugoService().Publish(ctx, resource)
}
func UploadAvatarHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid, ok := middleware.RetrieveUserIDFromContext(ctx)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Bad form data", http.StatusBadRequest)
		return
	}
	file, hdr, err := r.FormFile("avatar")
	if err != nil {
		http.Error(w, "Missing avatar file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	const avatarsDir = "avatars"
	if err := os.MkdirAll(avatarsDir, 0o755); err != nil {
		slog.Error("failed to create avatars dir", "err", err)
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	fname := fmt.Sprintf("%d_%d_%s", uid, time.Now().Unix(), filepath.Base(hdr.Filename))
	dstPath := filepath.Join(avatarsDir, fname)
	dst, err := os.Create(dstPath)
	if err != nil {
		slog.Error("failed to create file", "err", err)
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		slog.Error("failed to save file", "err", err)
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	avatarURL := "/avatars/" + fname
	if err := db.GetDao().UpdateUserAvatar(ctx, db.UpdateUserAvatarParams{
		AvatarUrl: avatarURL,
		ID:        uint64(uid),
	}); err != nil {
		slog.Error("db update failed", "err", err)
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	SendResource(map[string]string{"avatar_url": avatarURL}, w)
}

func DeleteAvatarHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid, ok := middleware.RetrieveUserIDFromContext(ctx)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := db.GetDao().GetUserById(ctx, uint64(uid))
	if err != nil {
		slog.Error("fetch user failed", "err", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if user.AvatarUrl != "" {
		fname := filepath.Base(user.AvatarUrl)
		fullpath := filepath.Join("avatars", fname)
		if rmErr := os.Remove(fullpath); rmErr != nil && !os.IsNotExist(rmErr) {
			slog.Error("remove avatar file failed", "path", fullpath, "err", rmErr)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}

	if err := db.GetDao().UpdateUserAvatar(ctx, db.UpdateUserAvatarParams{
		AvatarUrl: "",
		ID:        uint64(uid),
	}); err != nil {
		slog.Error("clear avatar url failed", "err", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"avatar_url":""}`))
}
