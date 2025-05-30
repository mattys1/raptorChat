// backend/src/pkg/api/handlers/user.go
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
    "github.com/mattys1/raptorChat/src/pkg/orm"
    "golang.org/x/crypto/bcrypt"
)

func GetRoomsOfUserHandler(w http.ResponseWriter, r *http.Request) {
    dao := db.GetDao()
    ctx := r.Context()
    uid, ok := middleware.RetrieveUserIDFromContext(ctx)
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

    if err := SendResource[[]db.Room](rooms, w); err != nil {
        slog.Error("Error sending rooms", "error", err)
    }
}

func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    uid, ok := middleware.RetrieveUserIDFromContext(ctx)
    if !ok {
        http.Error(w, "User ID not found in context", http.StatusInternalServerError)
        return
    }

    users, err := orm.GetAllUsers(ctx)
    if err != nil {
        slog.Error("Error fetching users", "error", err)
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
        return
    }

    filtered := slices.DeleteFunc(users, func(u orm.User) bool {
        return u.ID == uid
    })

    if err := SendResource(filtered, w); err != nil {
        slog.Error("Error sending users", "error", err)
    }
}

func GetOwnIDHandler(w http.ResponseWriter, r *http.Request) {
    uid, ok := middleware.RetrieveUserIDFromContext(r.Context())
    if !ok {
        http.Error(w, "User ID not found in context", http.StatusInternalServerError)
        return
    }

    slog.Info("User ID from context", "uid", uid)

    if err := SendResource(uid, w); err != nil {
        slog.Error("Error sending user", "error", err)
    }
}

func GetInvitesOfUserHandler(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    targetID, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 64)
    if err != nil {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }

    ormInvs, err := orm.GetInvitesToUser(ctx, targetID)
    if err != nil {
        slog.Error("Error fetching invites", "error", err)
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
        return
    }

    var invites []db.Invite
    for _, oi := range ormInvs {
        invites = append(invites, db.Invite{
            ID:         oi.ID,
            Type:       db.InvitesType(oi.Type),
            State:      db.InvitesState(oi.State),
            RoomID:     oi.RoomID,
            IssuerID:   oi.IssuerID,
            ReceiverID: oi.ReceiverID,
        })
    }

    invites = slices.DeleteFunc(invites, func(i db.Invite) bool {
        return i.State != db.InvitesStatePending
    })

    slog.Info("Sent invites", "invites", invites)
    if err := SendResource(invites, w); err != nil {
        slog.Error("Error sending invites", "error", err)
    }
}

func GetFriendsOfUserHandler(w http.ResponseWriter, r *http.Request) {
    dao := db.GetDao()
    ctx := r.Context()
    uid, ok := middleware.RetrieveUserIDFromContext(ctx)
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

    if err := SendResource(friends, w); err != nil {
        slog.Error("Error sending friends", "error", err)
    }
}

func GetUserHandler(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    targetID, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 64)
    if err != nil {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }

    user, err := orm.GetUserByID(ctx, targetID)
    if err != nil {
        slog.Error("Error fetching user", "error", err)
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
        return
    }

    if err := SendResource(user, w); err != nil {
        slog.Error("Error sending user", "error", err)
    }
}

type UpdatePasswordRequest struct {
    NewPassword string `json:"new_password"`
    OldPassword string `json:"old_password"`
}

func UpdatePasswordHandler(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    body, err := io.ReadAll(r.Body)
    if err != nil {
        http.Error(w, "Error reading request body", http.StatusBadRequest)
        return
    }

    uid, ok := middleware.RetrieveUserIDFromContext(ctx)
    if !ok {
        http.Error(w, "User ID not found in context", http.StatusInternalServerError)
        return
    }

    user, err := orm.GetUserByID(ctx, uid)
    if err != nil {
        slog.Error("Error fetching user", "error", err)
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
        return
    }

    var req UpdatePasswordRequest
    if err := json.Unmarshal(body, &req); err != nil {
        http.Error(w, "Error unmarshalling request body", http.StatusBadRequest)
        return
    }

    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
        http.Error(w, "Old password doesn't match", http.StatusBadRequest)
        return
    }

    hashedNew, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
    if err != nil {
        http.Error(w, "Error hashing new password", http.StatusInternalServerError)
        return
    }

    if bytes.Equal(hashedNew, []byte(user.Password)) {
        http.Error(w, "New password cannot be the same as the old one", http.StatusBadRequest)
        return
    }

    update := &orm.User{
        Username: user.Username,
        Email:    user.Email,
        Password: string(hashedNew),
    }
    if err := orm.UpdateUser(ctx, uid, update); err != nil {
        slog.Error("Error updating password", "error", err)
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}

func UpdateUsernameHandler(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    resource, err := messaging.GetEventResourceFromRequest(r)
    if err != nil {
        http.Error(w, "Error getting resource", http.StatusBadRequest)
        return
    }
    newUsername, err := messaging.GetEventResourceContents[string](resource)
    if err != nil {
        http.Error(w, "Error getting resource contents", http.StatusBadRequest)
        return
    }

    uid, ok := middleware.RetrieveUserIDFromContext(ctx)
    if !ok {
        http.Error(w, "User ID not found in context", http.StatusInternalServerError)
        return
    }

    user, err := orm.GetUserByID(ctx, uid)
    if err != nil {
        slog.Error("Error fetching user", "error", err)
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
        return
    }

    update := &orm.User{
        Username: *newUsername,
        Email:    user.Email,
        Password: user.Password,
    }
    if err := orm.UpdateUser(ctx, uid, update); err != nil {
        slog.Error("Error updating username", "error", err)
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
        return
    }

    messaging.GetCentrifugoService().Publish(ctx, resource)
    w.WriteHeader(http.StatusNoContent)
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
        slog.Error("failed to create avatars dir", "error", err)
        http.Error(w, "Server error", http.StatusInternalServerError)
        return
    }

    fname := fmt.Sprintf("%d_%d_%s", uid, time.Now().Unix(), filepath.Base(hdr.Filename))
    dstPath := filepath.Join(avatarsDir, fname)
    dst, err := os.Create(dstPath)
    if err != nil {
        slog.Error("failed to create file", "error", err)
        http.Error(w, "Server error", http.StatusInternalServerError)
        return
    }
    defer dst.Close()

    if _, err := io.Copy(dst, file); err != nil {
        slog.Error("failed to save file", "error", err)
        http.Error(w, "Server error", http.StatusInternalServerError)
        return
    }

    avatarURL := "/avatars/" + fname
    if err := orm.UpdateUserAvatar(ctx, uid, avatarURL); err != nil {
        slog.Error("ORM update failed", "error", err)
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

    user, err := orm.GetUserByID(ctx, uid)
    if err != nil {
        slog.Error("Error fetching user", "error", err)
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
        return
    }

    if user.AvatarURL != "" {
        fname := filepath.Base(user.AvatarURL)
        fullpath := filepath.Join("avatars", fname)
        if rmErr := os.Remove(fullpath); rmErr != nil && !os.IsNotExist(rmErr) {
            slog.Error("remove avatar file failed", "path", fullpath, "error", rmErr)
            http.Error(w, "Internal Server Error", http.StatusInternalServerError)
            return
        }
    }

    if err := orm.UpdateUserAvatar(ctx, uid, ""); err != nil {
        slog.Error("Error clearing avatar URL", "error", err)
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write([]byte(`{"avatar_url":""}`))
}