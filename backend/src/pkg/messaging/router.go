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

	r.Route("/api", func(r chi.Router) {
		r.Post("/login", auth.LoginHandler)
		r.Post("/register", auth.RegisterHandler)
	})
	
	return r
}
