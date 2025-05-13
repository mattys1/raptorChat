// backend/src/pkg/auth/register.go
package auth

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/mattys1/raptorChat/src/pkg/orm"
)

// This is json content for registration.
type RegistrationCredentials struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// This creates a new user via GORM.
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	// CORS preflight
	if r.Method == http.MethodOptions {
		return
	}

	var creds RegistrationCredentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// This hashes the password
	hashed, err := bcrypt.GenerateFromPassword([]byte(creds.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error processing password", http.StatusInternalServerError)
		return
	}

	// This builds ORM user model
	user := orm.User{
		Username: creds.Username,
		Email:    creds.Email,
		Password: string(hashed),
	}

	// This checks for duplicates
	if err := orm.CreateUser(ctx, &user); err != nil {
		if errors.Is(err, orm.ErrAlreadyExists) {
			http.Error(w, "User with this email already exists", http.StatusBadRequest)
		} else {
			http.Error(w, "Error creating user", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "registration successful"})
}
