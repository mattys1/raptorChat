-- +goose Up
-- +goose StatementBegin
ALTER TABLE users
  ADD COLUMN avatar_url VARCHAR(255) NOT NULL DEFAULT '';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users
  DROP COLUMN avatar_url;
-- +goose StatementEnd
