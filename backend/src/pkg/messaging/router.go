package messaging

import (
	"github.com/go-chi/chi/v5"

	"github.com/mattys1/raptorChat/src/pkg/admin"
	"github.com/mattys1/raptorChat/src/pkg/auth"
	"github.com/mattys1/raptorChat/src/pkg/middleware"
)

func Router() *chi.Mux {
	r := chi.NewRouter()

	// Global middleware
	r.Use(middleware.EnableCors)
	r.Use(middleware.LogRequest)

	// Authentication endpoints
	r.Post("/login", auth.LoginHandler)
	r.Post("/register", auth.RegisterHandler)

	// Protected API
	r.Route("/api", func(r chi.Router) {
		r.Use(middleware.VerifyJWT)

		// User endpoints
		r.Route("/user", func(r chi.Router) {
			r.Get("/me/rooms", middleware.RoomsHandler)
		})

		// Admin panel routes (requires 'view_admin_panel' permission)
		r.Route("/admin", func(r chi.Router) {
			r.Use(middleware.RequirePermission("view_admin_panel"))

			r.Get("/users", admin.ListUsers)
			r.Delete("/users/{userID}", admin.DeleteUser)
			// TODO: add role/permission assignment endpoints
		})
	})

	return r
}
