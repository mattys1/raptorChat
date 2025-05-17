-- name: GetAllUsers :many
SELECT * FROM users;

-- name: GetUserById :one
SELECT * FROM users WHERE id = ?;

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

-- name: DeleteRoom :exec
DELETE FROM rooms WHERE id = ?;

-- name: UpdateRoom :exec
UPDATE rooms SET name = ?, type = ?, owner_id = ? WHERE id = ?;

-- name: GetMessagesByRoom :many
SELECT * FROM messages WHERE room_id = ?;

-- name: GetUsersByRoom :many
SELECT u.* FROM users u
JOIN users_rooms ur ON ur.user_id = u.id
WHERE ur.room_id = ?;

-- name: GetCountOfRoom :one
SELECT member_count FROM rooms WHERE id = ?;

-- name: AddUserToRoom :exec
INSERT INTO users_rooms (user_id, room_id) VALUES (?, ?);

-- name: GetMessageById :one
SELECT * FROM messages WHERE id = ?;

-- name: CreateMessage :execresult
INSERT INTO messages (room_id, sender_id, contents) VALUES (?, ?, ?);

-- name: DeleteMessage :exec
UPDATE messages SET is_deleted = TRUE WHERE id = ?;

-- name: GetInviteById :one
SELECT * FROM invites WHERE id = ?;

-- name: CreateInvite :execresult
INSERT INTO invites (issuer_id, receiver_id, room_id, type, state) VALUES (?, ?, ?, ?, ?);

-- name: UpdateInvite :exec
UPDATE invites SET state = ? WHERE id = ?;

-- name: GetInvitesToUser :many
SELECT * FROM invites i WHERE i.receiver_id = ?;
-- name: GetRoles :many
SELECT id, name FROM roles;

-- name: GetPermissions :many
SELECT id, name FROM permissions;

-- name: GetPermissionsByRole :many
SELECT p.id, p.name
FROM permissions p
JOIN roles_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = ?;

-- name: GetRolesByUser :many
SELECT r.id, r.name
FROM roles r
JOIN users_roles ur ON r.id = ur.role_id
WHERE ur.user_id = ?;

-- name: GetPermissionsByUser :many
SELECT DISTINCT p.id, p.name
FROM permissions p
JOIN roles_permissions rp ON p.id = rp.permission_id
JOIN users_roles ur ON ur.role_id = rp.role_id
WHERE ur.user_id = ?;

-- name: AssignRoleToUser :exec
INSERT INTO users_roles (user_id, role_id) VALUES (?, ?);

-- name: RemoveRoleFromUser :exec
DELETE FROM users_roles WHERE user_id = ? AND role_id = ?;

-- name: AssignPermissionToRole :exec
INSERT INTO roles_permissions (role_id, permission_id) VALUES (?, ?);

-- name: RemovePermissionFromRole :exec
DELETE FROM roles_permissions WHERE role_id = ? AND permission_id = ?;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = ?;

-- name: CreateFriendship :execresult
INSERT INTO friendships (first_id, second_id, dm_id) VALUES (?, ?, ?);

-- name: DeleteFriendship :exec
DELETE FROM friendships WHERE id = ?;

-- name: GetFriendsOfUser :many
SELECT DISTINCT u.* FROM users u 
NATURAL JOIN friendships f
WHERE sqlc.arg(user_id) OR f.second_id = sqlc.arg(user_id);

-- name: GetRoleByName :one
SELECT id, name FROM roles WHERE name = ? LIMIT 1;

-- name: AssignRoleToUserInRoom :exec
INSERT INTO rooms_users_roles (room_id, user_id, role_id)
VALUES (?, ?, ?);

-- name: RemoveRoleFromUserInRoom :exec
DELETE FROM rooms_users_roles
WHERE room_id = ? AND user_id = ? AND role_id = ?;

-- name: GetRolesByUserInRoom :many
SELECT r.id, r.name
FROM   roles r
JOIN   rooms_users_roles rur ON rur.role_id = r.id
WHERE  rur.user_id = ? AND rur.room_id = ?;

-- name: UpdateUserAvatar :exec
UPDATE users
SET avatar_url = ?
WHERE id = ?;