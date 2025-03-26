-- +goose Up
-- +goose StatementBegin
ALTER TABLE users_rooms 
    DROP FOREIGN KEY users_rooms_ibfk_1,
    DROP FOREIGN KEY users_rooms_ibfk_2;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE users_rooms
    ADD CONSTRAINT fk_users_rooms_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_users_rooms_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users_rooms
    DROP FOREIGN KEY fk_users_rooms_user,
    DROP FOREIGN KEY fk_users_rooms_room;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE users_rooms
    ADD CONSTRAINT FOREIGN KEY (user_id) REFERENCES users(id),
    ADD CONSTRAINT FOREIGN KEY (room_id) REFERENCES rooms(id);
-- +goose StatementEnd
