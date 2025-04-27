package auth

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/mattys1/raptorChat/src/pkg/db"
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
