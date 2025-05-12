-- +goose Up

CREATE TABLE IF NOT EXISTS roles (
  id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50)     NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS permissions (
  id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)    NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS roles_permissions (
  role_id       BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id)       REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO roles (name) VALUES ('admin'), ('moderator'), ('user');

-- +goose Down
DROP TABLE IF EXISTS users_roles;
DROP TABLE IF EXISTS roles_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;