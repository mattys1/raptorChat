-- +goose Up
-- +goose StatementBegin
ALTER TABLE rooms 
	ADD COLUMN owner_id BIGINT UNSIGNED REFERENCES users(id),
	ADD COLUMN type ENUM ('direct', 'group') NOT NULL,
	ADD CONSTRAINT valid_room_type CHECK (
		(type = 'direct' AND owner_id IS NULL) OR
		(type = 'group' AND owner_id IS NOT NULL)
	
);	
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE rooms 
	DROP COLUMN owner_id,
	DROP COLUMN type,
	DROP CONSTRAINT valid_room_type;
-- +goose StatementEnd
