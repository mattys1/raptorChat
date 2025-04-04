-- +goose Up
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';

-- +goose Down
ALTER TABLE users DROP COLUMN IF EXISTS role;
