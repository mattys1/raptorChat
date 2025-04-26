package api

import (
	"github.com/go-chi/chi/v5"

	"github.com/mattys1/raptorChat/src/pkg/api/handlers"
	"github.com/mattys1/raptorChat/src/pkg/auth"
	"github.com/mattys1/raptorChat/src/pkg/middleware"
)

func Router() *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.EnableCors)
	r.Use(middleware.LogRequest)

	r.Post("/login", auth.LoginHandler)
	r.Post("/register", auth.RegisterHandler)

	r.Route("/api", func(r chi.Router) {
		r.Use(middleware.VerifyJWT)
		r.Post("/invites", handlers.CreateInviteHandler)
		r.Route("/user", func(r chi.Router) {
			r.Get("/me/rooms", handlers.GetRoomsOfUserHandler) // ideally this should be merged into {id} and a middleware should be set up to check whether the user is the same
			r.Get("/me", handlers.GetOwnIDHandler)
			r.Get("/", handlers.GetAllUsersHandler)
			r.Get("/{id}/invites", handlers.GetInvitesOfUserHandler)
		})
		r.Route("/rooms", func(r chi.Router) {
			r.Route("/{id}", func(r chi.Router) {
				r.Get("/messages", handlers.GetMessagesOfRoomHandler)
				r.Post("/messages", handlers.SendMessageHandler)

				r.Get("/user", handlers.GetUsersOfRoomHandler)
			})
		})
	})

	
	return r
}
