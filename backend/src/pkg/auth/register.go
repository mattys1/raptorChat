package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"regexp"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/mattys1/raptorChat/src/pkg/db"
)

type RegistrationCredentials struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

// RegisterHandler godoc
// @Summary Register a new user
// @Description Registers a new user with an email, username, and password.
// @Tags auth
// @Accept json
// @Produce json
// @Param credentials body RegistrationCredentials true "User registration details"
// @Success 200 {object} map[string]string "Registration successful"
// @Failure 400 {string} string "Bad request"
// @Failure 500 {string} string "Internal Server Error"
// @Router /register [post]
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var creds RegistrationCredentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	emailRegex := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$`)
	if !emailRegex.MatchString(creds.Email) {
		http.Error(w, "Invalid email format", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	dao := db.GetDao()

	_, err := dao.GetUserByEmail(ctx, creds.Email)
	if err == nil {
		http.Error(w, "User with this email already exists", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(creds.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error processing password", http.StatusInternalServerError)
		return
	}

	err = dao.CreateUser(ctx, db.CreateUserParams{
		Username: creds.Username,
		Email:    creds.Email,
		Password: string(hashedPassword),
	})
	if err != nil {
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "registration successful"})
}
