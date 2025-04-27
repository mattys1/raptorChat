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

-- name: CreateMessage :execresult
INSERT INTO messages (room_id, sender_id, contents) VALUES (?, ?, ?);

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