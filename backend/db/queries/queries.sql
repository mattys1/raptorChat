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

-- name: GetRoomById :one
SELECT * FROM rooms WHERE id = ?;

-- name: CreateRoom :execresult
INSERT INTO rooms (name, owner_id, type) VALUES (?, ?, ?);

-- name: CreateUser :exec
INSERT INTO users (username, email, password, created_at)
VALUES (?, ?, ?, NOW());

-- name: GetMessagesByRoom :many
SELECT * FROM messages WHERE room_id = ?;

-- name: GetUsersByRoom :many
SELECT u.* FROM users u
JOIN users_rooms ur ON ur.user_id = u.id
WHERE ur.room_id = ?;

-- name: AddUserToRoom :exec
INSERT INTO users_rooms (user_id, room_id) VALUES (?, ?);

-- name: GetMessageById :one
SELECT * FROM messages WHERE id = ?;

-- name: CreateMessage :execresult
INSERT INTO messages (room_id, sender_id, contents) VALUES (?, ?, ?);

-- name: GetInviteById :one
SELECT * FROM invites WHERE id = ?;

-- name: CreateInvite :execresult
INSERT INTO invites (issuer_id, receiver_id, room_id, type, state) VALUES (?, ?, ?, ?, ?);

-- name: UpdateInvite :exec
UPDATE invites SET state = ? WHERE id = ?;

-- name: GetInvitesToUser :many
SELECT * FROM invites i WHERE i.receiver_id = ?;
