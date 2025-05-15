-- +goose Up
-- +goose StatementBegin
ALTER TABLE messages 
  ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE messages 
  DROP COLUMN deleted_at, 
  DROP COLUMN is_deleted;
-- +goose StatementEnd
