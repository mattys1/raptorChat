-- +goose Up
-- +goose StatementBegin
ALTER TABLE rooms 
	ADD owner_id BIGINT UNSIGNED REFERENCES users(id) ON DELETE CASCADE,
	ADD type ENUM('direct', 'group') NOT NULL,
	ADD CONSTRAINT valid_room_type CHECK ((owner_id IS NOT NULL AND type = 'group') OR (owner_id IS NULL AND type = 'direct'));
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE rooms
	DROP CONSTRAINT valid_room_type,
	DROP COLUMN owner_id,
	DROP COLUMN type;
-- +goose StatementEnd
