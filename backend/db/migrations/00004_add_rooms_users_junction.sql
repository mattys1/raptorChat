-- +goose Up
-- +goose StatementBegin
CREATE TABLE users_rooms (
	user_id BIGINT UNSIGNED NOT NULL,
	room_id BIGINT UNSIGNED NOT NULL,
	PRIMARY KEY (user_id, room_id),
	FOREIGN KEY (user_id) REFERENCES users(id), 
	FOREIGN KEY (room_id) REFERENCES rooms(id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS users_rooms;
-- +goose StatementEnd
