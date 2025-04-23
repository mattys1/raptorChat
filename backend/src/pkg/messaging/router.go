package messaging

import (
	"github.com/go-chi/chi/v5"

	"github.com/mattys1/raptorChat/src/pkg/middleware"
	"github.com/mattys1/raptorChat/src/pkg/auth"
)

func Router() *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.EnableCors)
	r.Use(middleware.LogRequest)

	r.Post("/login", auth.LoginHandler)
	r.Post("/register", auth.RegisterHandler)

	r.Route("/api", func(r chi.Router) {
	r.Use(middleware.VerifyJWT)
		r.Route("/user", func(r chi.Router) {
			r.Get("/me/rooms", middleware.RoomsHandler) // ideally this should be merged into {id} and a middleware should be set up to check whether the user is the same
		})
	})

	
	return r
}
