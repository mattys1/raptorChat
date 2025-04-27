-- +goose Up
INSERT INTO permissions (name) VALUES ('view_admin_panel');

INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name = 'view_admin_panel'
WHERE r.name = 'admin';

-- +goose Down
DELETE rp
FROM roles_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'admin' AND p.name = 'view_admin_panel';

DELETE FROM permissions WHERE name = 'view_admin_panel';