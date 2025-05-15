-- +goose Up
-- +goose StatementBegin
ALTER TABLE rooms ADD COLUMN member_count INT DEFAULT 0;
-- +goose StatementEnd

-- +goose StatementBegin
UPDATE rooms r 
SET member_count = (
    SELECT COUNT(*) 
    FROM users_rooms ur 
    WHERE ur.room_id = r.id
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE rooms DROP COLUMN member_count;
-- +goose StatementEnd
