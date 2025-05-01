-- +goose Up
-- +goose StatementBegin
ALTER TABLE messages
DROP FOREIGN KEY messages_ibfk_1,
DROP FOREIGN KEY messages_ibfk_2;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE messages
ADD CONSTRAINT messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT messages_room_id_fkey 
FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE messages
DROP FOREIGN KEY messages_sender_id_fkey,
DROP FOREIGN KEY messages_room_id_fkey;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE messages
ADD CONSTRAINT messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES users(id),
ADD CONSTRAINT messages_room_id_fkey
FOREIGN KEY (room_id) REFERENCES rooms(id);
-- +goose StatementEnd
