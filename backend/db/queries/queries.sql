-- name: GetAllUsers :many
SELECT * FROM users;

-- name: GetUserById :one
SELECT * FROM users WHERE id = ?;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = ? LIMIT 1;

-- name: GetAllRooms :many
SELECT * FROM rooms;

-- name: CreateUser :exec
INSERT INTO users (username, email, password, created_at)
VALUES (?, ?, ?, NOW());

-- name: GetMessagesByRoom :many
SELECT * FROM messages WHERE room_id = ?;

-- name: GetUsersByRoom :many
SELECT u.* FROM users u
JOIN users_rooms ur ON ur.room_id = u.id
WHERE ur.room_id = ?;

-- name: CreateMessage :exec
INSERT INTO messages (room_id, sender_id, contents) VALUES (?, ?, ?)
