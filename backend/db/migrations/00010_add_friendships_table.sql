-- +goose Up
-- +goose StatementBegin
CREATE TABLE friendships (
	id SERIAL PRIMARY KEY,
	first_id BIGINT UNSIGNED NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	second_id BIGINT UNSIGNED NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	dm_id BIGINT UNSIGNED NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS friendships;
-- +goose StatementEnd
