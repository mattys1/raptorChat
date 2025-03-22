-- +goose Up
-- +goose StatementBegin
CREATE TABLE rooms (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) UNIQUE
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE messages (
	id SERIAL PRIMARY KEY,
	sender_id BIGINT UNSIGNED NOT NULL,
	room_id BIGINT UNSIGNED NOT NULL,
	contents TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (sender_id) REFERENCES users(id),
	FOREIGN KEY (room_id) REFERENCES rooms(id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS rooms;
-- +goose StatementEnd
