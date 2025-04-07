package acl

import (
	"log"
	"net/http"

	"github.com/casbin/casbin/v2"
	"github.com/casbin/casbin/v2/model"
	"github.com/mattys1/raptorChat/src/pkg/auth"
)

// NewEnforcer creates a Casbin enforcer using a simple RBAC model.
func NewEnforcer() *casbin.Enforcer {
	m := `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = r.sub == p.sub && r.obj == p.obj && r.act == p.act
`
	mModel, err := model.NewModelFromString(m)
	if err != nil {
		log.Fatal("Failed to create Casbin model:", err)
	}
	enforcer, err := casbin.NewEnforcer(mModel)
	if err != nil {
		log.Fatal("Failed to create Casbin enforcer:", err)
	}
	enforcer.AddPolicy("admin", "/admin", "GET")
	enforcer.AddPolicy("admin", "/admin", "POST")
	enforcer.AddPolicy("user", "/protected", "GET")

	return enforcer
}

// CasbinMiddleware enforces ACL based on the user’s role.
// @Summary ACL middleware using Casbin
// @Description Enforces access control using the Casbin enforcer. Assumes JWT middleware has set the user claims in the context.
func CasbinMiddleware(enforcer *casbin.Enforcer, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, ok := auth.RetrieveUserClaimsFromContext(r.Context())
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		role := claims.Role

		obj := r.URL.Path
		act := r.Method

		allowed, err := enforcer.Enforce(role, obj, act)
		if err != nil {
			http.Error(w, "Error during ACL enforcement", http.StatusInternalServerError)
			return
		}
		if !allowed {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}
