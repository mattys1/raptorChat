-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL AFTER email;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users DROP COLUMN IF EXISTS password;
-- +goose StatementEnd
