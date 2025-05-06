-- +goose Up
CREATE TABLE IF NOT EXISTS rooms_users_roles (
    room_id  BIGINT UNSIGNED NOT NULL,
    user_id  BIGINT UNSIGNED NOT NULL,
    role_id  BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (room_id, user_id, role_id),
    CONSTRAINT fk_rur_room FOREIGN KEY (room_id) REFERENCES rooms(id)  ON DELETE CASCADE,
    CONSTRAINT fk_rur_user FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_rur_role FOREIGN KEY (role_id) REFERENCES roles(id)  ON DELETE CASCADE
);

INSERT IGNORE INTO roles (name) VALUES ('owner');

INSERT IGNORE INTO permissions (name) VALUES ('manage_room');

INSERT IGNORE INTO roles_permissions (role_id, permission_id)
SELECT r.id , p.id
FROM   roles r , permissions p
WHERE  p.name = 'manage_room' AND r.name IN ('owner','moderator');

-- +goose Down
DROP TABLE IF EXISTS rooms_users_roles;