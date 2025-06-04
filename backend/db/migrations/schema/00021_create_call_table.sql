-- +goose Up
-- +goose StatementBegin
CREATE TABLE calls (
	id SERIAL,
	room_id BIGINT UNSIGNED NOT NULL,
	status enum('active', 'completed', 'rejected') NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
	participant_count INT UNSIGNED DEFAULT 1 NOT NULL,

	CONSTRAINT calls_rooms_fk FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE call_participants (
	call_id BIGINT UNSIGNED NOT NULL,
	user_id BIGINT UNSIGNED NOT NULL,
	joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

	CONSTRAINT call_participants_calls_fk FOREIGN KEY (call_id) REFERENCES calls(id) ON DELETE CASCADE,
	CONSTRAINT call_participants_users_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	PRIMARY KEY (call_id, user_id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE call_participants;
-- +goose StatementEnd

-- +goose StatementBegin
DROP TABLE calls;
-- +goose StatementEnd

