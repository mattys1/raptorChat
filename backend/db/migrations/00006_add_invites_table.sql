-- +goose Up
-- +goose StatementBegin
CREATE TABLE invites (
	id SERIAL PRIMARY KEY,
	sender_id BIGINT UNSIGNED NOT NULL,
	recipient_id BIGINT UNSIGNED NOT NULL,
	room_id BIGINT UNSIGNED,
	invite_type ENUM ('friendship', 'room') NOT NULL,
	status ENUM ('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
	CONSTRAINT valid_invite_type CHECK (
		(invite_type = 'friendship' AND room_id IS NULL) OR
		(invite_type = 'room' AND room_id IS NOT NULL)
	)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS invites;
-- +goose StatementEnd
