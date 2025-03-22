-- name: GetAllUsers :many
SELECT * FROM users;

-- name: GetUserByEmail :one
SELECT id, username, email, password, created_at FROM users WHERE email = ? LIMIT 1;

-- name: CreateUser :exec
INSERT INTO users (username, email, password, created_at)
VALUES (?, ?, ?, NOW());