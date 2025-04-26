-- +goose Up
-- +goose StatementBegin
CREATE TABLE invites (
	id SERIAL PRIMARY KEY,
	type ENUM('direct', 'group') NOT NULL,
	state ENUM('pending', 'accepted', 'declined') NOT NULL DEFAULT 'pending',
    room_id BIGINT UNSIGNED,
    issuer_id BIGINT UNSIGNED NOT NULL,
    receiver_id BIGINT UNSIGNED NOT NULL,
    CONSTRAINT correct_type CHECK ((room_id IS NOT NULL AND type = 'group') OR (room_id IS NULL AND type = 'direct')),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (issuer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
-- +goose StatementEnd


-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS invites;
-- +goose StatementEnd
