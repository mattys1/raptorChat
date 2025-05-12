package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/mattys1/raptorChat/src/pkg/db"

	// lksdk "github.com/livekit/server-sdk-go/v2"
	lkauth "github.com/livekit/protocol/auth"
)

var jwtKey = []byte("secret_key")

type CentrifugoTokenClaims struct {
	Sub      string         `json:"sub"`
	Info     map[string]any `json:"info,omitempty"`
	Channels []string       `json:"channels,omitempty"`
}

type Claims struct {
	UserID      uint64   `json:"user_id"`
	Permissions []string `json:"permissions"`
	jwt.RegisteredClaims
}

func GenerateCentrifugoToken(userID uint64) (string, error) {
	userIDStr := fmt.Sprintf("%d", userID)
	slog.Info("Generating Centrifugo token", "userID", userIDStr)

	claims := jwt.MapClaims{
		"sub": userIDStr,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(jwtKey)
}

func GenerateToken(userID uint64) (string, error) {
	// Fetch permissions from DB
	dao := db.GetDao()
	perms, err := dao.GetPermissionsByUser(context.Background(), userID)
	if err != nil {
		return "", err
	}
	permNames := make([]string, len(perms))
	for i, p := range perms {
		permNames[i] = p.Name
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID:      userID,
		Permissions: permNames,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "raptorChat",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

func ValidateToken(tokenStr string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtKey, nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

func CentrifugoTokenHandler(w http.ResponseWriter, r *http.Request) {
	// uidstr, ok := r.Context().Value("userID").(uint64)
	uidstr, err := io.ReadAll(r.Body)
	defer r.Body.Close()
	if err != nil {
		slog.Error("Error reading user ID", "body", uidstr, "error", err)
		http.Error(w, "Error reading user ID", http.StatusBadRequest)
		return
	}
	uid, err := strconv.Atoi(string(uidstr))
	if err != nil {
		slog.Error("Invalid user ID", "userID", uidstr, "error", err)
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	token, err := GenerateCentrifugoToken(uint64(uid))
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	slog.Info("Generated Centrifugo token", "token", token)
	w.Header().Set("Content-Type", "application/json")

	tokenResponse, err := json.Marshal(token)
	if err != nil {
		slog.Error("Error marshalling token response", "error", err)
		http.Error(w, "Error generating token response", http.StatusInternalServerError)
		return
	}
	slog.Info("Token response", "response", string(tokenResponse))

	w.Write(tokenResponse)
}

func GenerateLivekitRoomToken(apiKey, apiSecret, room, identity string) (string, error) {
	slog.Info("Generating Livekit token", "apiKey", apiKey, "apiSecret", apiSecret, "room", room, "identity", identity)
	accesToken := lkauth.NewAccessToken(apiKey, apiSecret)
	grant := &lkauth.VideoGrant{
		RoomJoin: true,
		Room:     room,
	}
	accesToken.SetVideoGrant(grant).
		SetIdentity(identity)

	return accesToken.ToJWT()
}

func LivekitTokenHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("uid")

	// normal url extract doesn't work
	pathParts := strings.Split(r.URL.Path, "/")
	roomId := ""
	if len(pathParts) >= 3 {
		roomId = pathParts[2]
	}
	slog.Info("Roomid", "id", roomId)
	slog.Info("Query", "query", r.URL.Path)

	token, err := GenerateLivekitRoomToken(os.Getenv("LIVEKIT_API_KEY"), os.Getenv("LIVEKIT_API_SECRET"), roomId, userID)
	if err != nil {
		slog.Error("Error generating Livekit token", "error", err)
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	slog.Info("Generated Livekit token", "token", token)
	w.Header().Set("Content-Type", "application/json")
	tokenResponse, err := json.Marshal(token)
	if err != nil {
		slog.Error("Error marshalling token response", "error", err)
		http.Error(w, "Error generating token response", http.StatusInternalServerError)
		return
	}

	w.Write(tokenResponse)
}
