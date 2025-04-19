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

-- name: CreateRoom :execresult
INSERT INTO rooms (owner_id, name, type) VALUES (?, ?, ?);

-- name: DeleteRoom :exec
DELETE FROM rooms WHERE id = ?;

-- name: GetRoomById :one
SELECT * FROM rooms WHERE id = ?;

-- name: AddUserToRoom :exec
INSERT INTO users_rooms (user_id, room_id) VALUES (?, ?);

-- name: GetMessagesByRoom :many
SELECT * FROM messages WHERE room_id = ?;

-- name: GetUsersByRoom :many
SELECT u.* FROM users u
JOIN users_rooms ur ON ur.user_id = u.id
WHERE ur.room_id = ?;

-- name: CreateMessage :execresult
INSERT INTO messages (room_id, sender_id, contents) VALUES (?, ?, ?);

-- name: GetInviteById :one
SELECT * FROM invites WHERE id = ?;

-- name: GetInviteSender :one
SELECT u.* FROM users u
JOIN invites i ON i.sender_id = u.id
WHERE i.id = ?;

-- name: GetInviteRecipient :one
SELECT u.* FROM users u
JOIN invites i ON i.recipient_id = u.id
WHERE i.id = ?;
