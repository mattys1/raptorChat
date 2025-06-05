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

//
// GetRoomsOfUserHandler godoc
// @Summary     List rooms of the current user
// @Description Returns all chat rooms belonging to the authenticated user
// @Tags        users, rooms
// @Produce     json
// @Success     200  {array}   db.Room
// @Failure     401  {object}  ErrorResponse  "Unauthorized or missing token"
// @Failure     500  {object}  ErrorResponse  "Internal Server Error"
// @Security    ApiKeyAuth
// @Router      /users/me/rooms [get]
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

//
// GetAllUsersHandler godoc
// @Summary     List all users (excluding current user)
// @Description Returns a list of all users in the system except the authenticated user
// @Tags        users
// @Produce     json
// @Success     200  {array}   orm.User
// @Failure     401  {object}  ErrorResponse  "Unauthorized or missing token"
// @Failure     500  {object}  ErrorResponse  "Internal Server Error"
// @Security    ApiKeyAuth
// @Router      /users [get]
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

//
// GetOwnIDHandler godoc
// @Summary     Get authenticated user's ID
// @Description Returns the ID of the currently authenticated user
// @Tags        users
// @Produce     json
// @Success     200  {integer}  int  "User ID"
// @Failure     401  {object}   ErrorResponse  "Unauthorized or missing token"
// @Security    ApiKeyAuth
// @Router      /users/me [get]
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

//
// GetInvitesOfUserHandler godoc
// @Summary     Get pending invites for a user
// @Description Returns all pending invites sent to the specified user
// @Tags        users, invites
// @Produce     json
// @Param       id   path      int  true  "Target User ID"
// @Success     200  {array}   db.Invite
// @Failure     400  {object}  ErrorResponse  "Invalid user ID"
// @Failure     401  {object}  ErrorResponse  "Unauthorized or missing token"
// @Failure     500  {object}  ErrorResponse  "Internal Server Error"
// @Security    ApiKeyAuth
// @Router      /users/{id}/invites [get]
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

//
// GetFriendsOfUserHandler godoc
// @Summary     Get friends of the authenticated user
// @Description Returns a list of friends (other users) for the currently authenticated user
// @Tags        users, friends
// @Produce     json
// @Success     200  {array}   orm.User
// @Failure     401  {object}  ErrorResponse  "Unauthorized or missing token"
// @Failure     500  {object}  ErrorResponse  "Internal Server Error"
// @Security    ApiKeyAuth
// @Router      /users/me/friends [get]
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

//
// GetUserHandler godoc
// @Summary     Get user by ID
// @Description Returns the user object for the specified user ID
// @Tags        users
// @Produce     json
// @Param       id   path      int  true  "User ID"
// @Success     200  {object}  orm.User
// @Failure     400  {object}  ErrorResponse  "Invalid user ID"
// @Failure     401  {object}  ErrorResponse  "Unauthorized or missing token"
// @Failure     500  {object}  ErrorResponse  "Internal Server Error"
// @Security    ApiKeyAuth
// @Router      /users/{id} [get]
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

//
// UpdatePasswordHandler godoc
// @Summary     Update current user's password
// @Description Updates the authenticated user's password, verifying the old password first
// @Tags        users
// @Accept      json
// @Produce     json
// @Param       payload  body      UpdatePasswordRequest  true  "Old and new password payload"
// @Success     204      {string}  string                 "No Content"
// @Failure     400      {object}  ErrorResponse          "Bad request or validation failure"
// @Failure     401      {object}  ErrorResponse          "Unauthorized or missing token"
// @Failure     500      {object}  ErrorResponse          "Internal Server Error"
// @Security    ApiKeyAuth
// @Router      /users/me/password [put]
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

//
// UpdateUsernameHandler godoc
// @Summary     Update current user's username
// @Description Updates the authenticated user's username and publishes an event via Centrifugo
// @Tags        users
// @Accept      json
// @Produce     json
// @Param       new_username  body      object  true  "JSON payload: {\"new_username\": \"newName\"}"
// @Success     204           {string}  string  "No Content"
// @Failure     400           {object}  ErrorResponse  "Bad request or validation failure"
// @Failure     401           {object}  ErrorResponse  "Unauthorized or missing token"
// @Failure     500           {object}  ErrorResponse  "Internal Server Error"
// @Security    ApiKeyAuth
// @Router      /users/me/username [put]
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


//
// UploadAvatarHandler godoc
// @Summary     Upload or update user's avatar
// @Description Accepts a multipart/form-data file upload for the authenticated user's avatar, stores it, and updates the user's record
// @Tags        users, avatars
// @Accept      multipart/form-data
// @Produce     json
// @Param       avatar  formData  file  true  "Avatar image file (JPEG/PNG/etc.)"
// @Success     200     {object}  map[string]string  "Returns {\"avatar_url\": \"<url>\"}"
// @Failure     400     {object}  ErrorResponse       "Bad form data or missing file"
// @Failure     401     {object}  ErrorResponse       "Unauthorized or missing token"
// @Failure     500     {object}  ErrorResponse       "Server error while saving avatar"
// @Security    ApiKeyAuth
// @Router      /users/me/avatar [post]
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

//
// DeleteAvatarHandler godoc
// @Summary     Delete user's avatar
// @Description Deletes the authenticated user's avatar file and clears the URL in the database
// @Tags        users, avatars
// @Produce     json
// @Success     200  {object}  map[string]string  "Returns {\"avatar_url\": \"\"}"
// @Failure     401  {object}  ErrorResponse       "Unauthorized or missing token"
// @Failure     500  {object}  ErrorResponse       "Server error while deleting avatar"
// @Security    ApiKeyAuth
// @Router      /users/me/avatar [delete]
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

    if *user.AvatarUrl != "" {
        fname := filepath.Base(*user.AvatarUrl)
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

type ErrorResponse struct {
    Message string `json:"message"`
}
