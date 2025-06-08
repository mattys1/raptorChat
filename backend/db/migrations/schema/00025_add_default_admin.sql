-- +goose Up
INSERT INTO users (username, email, password)
SELECT 'admin', 'admin@gmail.com', '$2b$10$6NeHxZHMtKTd5Ib2AZlIEekw1klR7fZbZ5IZVCapQwSiZQpc8wEQa'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO users_roles (user_id, role_id)
SELECT 1, id
FROM roles
WHERE name = 'admin'
  AND NOT EXISTS (
    SELECT 1
    FROM users_roles
    WHERE user_id = 1
      AND role_id = roles.id
  );

-- +goose Down
DELETE FROM users_roles
WHERE user_id = 1
  AND role_id IN (
    SELECT id FROM roles WHERE name = 'admin'
  );

DELETE FROM users WHERE username = 'admin';
