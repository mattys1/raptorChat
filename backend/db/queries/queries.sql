-- name: GetAllUsers :many
SELECT * FROM users;

-- name: GetUserById :one
SELECT * FROM users WHERE id = ?;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = ? LIMIT 1;

-- name: GetAllRooms :many
SELECT * FROM rooms;

-- name: GetRoomsByUser :many
SELECT r.* FROM rooms r
JOIN users_rooms ur ON ur.room_id = r.id
WHERE ur.user_id = ?;

-- name: CreateUser :exec
INSERT INTO users (username, email, password, created_at)
VALUES (?, ?, ?, NOW());

-- name: GetMessagesByRoom :many
SELECT * FROM messages WHERE room_id = ?;

-- name: GetUsersByRoom :many
SELECT u.* FROM users u
JOIN users_rooms ur ON ur.user_id = u.id
WHERE ur.room_id = ?;

-- name: GetMessageById :one
SELECT * FROM messages WHERE id = ?;

-- name: CreateMessage :execresult
INSERT INTO messages (room_id, sender_id, contents) VALUES (?, ?, ?)

