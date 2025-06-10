package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/mattys1/raptorChat/src/pkg/admin"
	"github.com/mattys1/raptorChat/src/pkg/api/handlers"
	"github.com/mattys1/raptorChat/src/pkg/auth"
	"github.com/mattys1/raptorChat/src/pkg/middleware"
)

func Router() *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.EnableCors)
	r.Use(middleware.LogRequest)

	r.Handle("/avatars/*", http.StripPrefix("/avatars/", http.FileServer(http.Dir("avatars"))))

	r.Post("/login", auth.LoginHandler)
	r.Post("/register", auth.RegisterHandler)

	r.With(middleware.VerifyJWT).Post("/centrifugo/token", auth.CentrifugoTokenHandler)
	r.Route("/livekit/{chatId}", func(r chi.Router) {
		r.With(middleware.VerifyJWT).Get("/token", auth.LivekitTokenHandler)
	})

	r.Route("/api", func(r chi.Router) {
		r.Use(middleware.VerifyJWT)

		r.Post("/invites", handlers.CreateInviteHandler)
		r.Put("/invites/{id}", handlers.UpdateInviteHandler)

		r.Route("/user", func(r chi.Router) {
			r.Route("/me", func(r chi.Router) {
				r.Get("/rooms", handlers.GetRoomsOfUserHandler)
				r.Get("/", handlers.GetOwnIDHandler)

				r.Patch("/password", handlers.UpdatePasswordHandler)

				r.Patch("/username", handlers.UpdateUsernameHandler)

				r.Post("/avatar", handlers.UploadAvatarHandler)
				r.Delete("/avatar", handlers.DeleteAvatarHandler)

				r.Get("/activity", handlers.GetOwnActivityHandler)
			})
			r.Get("/", handlers.GetAllUsersHandler)

			r.Route("/{id}", func(r chi.Router) {
				r.Get("/invites", handlers.GetInvitesOfUserHandler)
				r.Get("/friends", handlers.GetFriendsOfUserHandler)
				r.Get("/dm", handlers.GetDMWithSenderHandler)
				r.Get("/", handlers.GetUserHandler)
			})
		})

		r.Route("/rooms", func(r chi.Router) {
			r.Post("/", handlers.CreateRoomHandler)

			r.Route("/{id}", func(r chi.Router) {
				r.Route("/messages", func(r chi.Router) {
					r.Get("/", handlers.GetMessagesOfRoomHandler)
					r.Post("/", handlers.SendMessageHandler)
					r.Delete("/", handlers.DeleteMessageHandler)
				})

				r.Route("/calls", func(r chi.Router) {
					r.Get("/", handlers.GetCallsOfRoomHandler)

					r.Post("/joined", handlers.JoinOrCreateCallHandler)
					r.Post("/leave", handlers.LeaveOrEndCallHandler)
				})

				r.Get("/user", handlers.GetUsersOfRoomHandler)
				r.Get("/user/count", handlers.GetCountOfRoomHandler)
				r.Get("/myroles", handlers.GetMyRolesHandler)
				r.Post("/moderators/{userID}", handlers.DesignateModeratorHandler)

				r.Get("/", handlers.GetRoomHandler)
				r.Put("/", handlers.UpdateRoomHandler)
				r.Delete("/", handlers.DeleteRoomHandler)
			})
		})

		r.Route("/admin", func(r chi.Router) {
			r.Use(middleware.RequirePermission("view_admin_panel"))
			r.Get("/users", admin.ListUsersHandler)
			r.Post("/users", admin.CreateUserHandler)
			r.Delete("/users/{userID}", admin.DeleteUserHandler)
			r.Put("/users/{userID}/admin", admin.AssignAdminHandler)
		})
	})

	return r
}
