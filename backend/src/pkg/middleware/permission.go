package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/mattys1/raptorChat/src/pkg/auth"
)

// This retrieves a JWT from header or cookie
func extractToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if parts := strings.SplitN(authHeader, " ", 2); len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
		return parts[1]
	}
	if cookie, err := r.Cookie("token"); err == nil {
		return cookie.Value
	}
	return ""
}

// checks if the user has permissions in JWT claim
func RequirePermission(permission string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenStr := extractToken(r)
			if tokenStr == "" {
				http.Error(w, "Missing token", http.StatusUnauthorized)
				return
			}
			claims, err := auth.ValidateToken(tokenStr)
			if err != nil {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}
			for _, p := range claims.Permissions {
				if p == permission {
					ctx := context.WithValue(r.Context(), "userID", claims.UserID)
					next.ServeHTTP(w, r.WithContext(ctx))
					return
				}
			}
			http.Error(w, "Forbidden", http.StatusForbidden)
		})
	}
}
