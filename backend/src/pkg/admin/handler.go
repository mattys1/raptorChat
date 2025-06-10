package admin

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/mattys1/raptorChat/src/pkg/orm"
)

type CreateUserRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error processing password", http.StatusInternalServerError)
		return
	}

	user := orm.User{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hashed),
	}

	if err := orm.CreateUser(ctx, &user); err != nil {
		if errors.Is(err, orm.ErrAlreadyExists) {
			http.Error(w, "User with this email already exists", http.StatusBadRequest)
		} else {
			http.Error(w, "Error creating user", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{
		"id":       user.ID,
		"username": user.Username,
		"email":    user.Email,
	})
}

func ListUsersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	users, err := orm.ListUsers(ctx)
	if err != nil {
		http.Error(w, "Error listing users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func DeleteUserHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method == http.MethodOptions {
        return
    }
    if r.Method != http.MethodDelete {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    idStr := chi.URLParam(r, "userID")
    id, err := strconv.ParseUint(idStr, 10, 64)
    if err != nil {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }

    ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
    defer cancel()

    var userWithRoles orm.User
    if err := orm.GetORM().
        WithContext(ctx).
        Preload("Roles").
        Preload("Roles.Role").
        First(&userWithRoles, id).Error; err != nil {
        http.Error(w, "Error checking user role: "+err.Error(), http.StatusInternalServerError)
        return
    }
    for _, ur := range userWithRoles.Roles {
        if ur.Role.Name == "admin" {
            http.Error(w, "Cannot delete user: user is an admin", http.StatusBadRequest)
            return
        }
    }

    if err := orm.DeleteUser(ctx, id); err != nil {
        http.Error(w, "Error deleting user", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}

func AssignAdminHandler(w http.ResponseWriter, r *http.Request) {
    idStr := chi.URLParam(r, "userID")
    id, err := strconv.ParseUint(idStr, 10, 64)
    if err != nil {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }

    ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
    defer cancel()

    if err := orm.AssignRoleToUser(ctx, id, "admin"); err != nil {
        http.Error(w, "Error assigning admin role", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}