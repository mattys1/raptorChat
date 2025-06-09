-- +goose Up
ALTER TABLE calls
  MODIFY COLUMN status
    enum('pending','active','completed','rejected') NOT NULL DEFAULT 'active';
-- +goose Down
ALTER TABLE calls
  MODIFY COLUMN status
    enum('active','completed','rejected') NOT NULL DEFAULT 'active';