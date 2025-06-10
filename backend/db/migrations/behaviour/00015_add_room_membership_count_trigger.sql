-- +goose Up
-- +goose StatementBegin
CREATE TRIGGER after_user_joins_room
AFTER INSERT ON users_rooms
FOR EACH ROW
BEGIN
    UPDATE rooms 
    SET member_count = member_count + 1 
    WHERE id = NEW.room_id;
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER after_user_leaves_room
AFTER DELETE ON users_rooms
FOR EACH ROW
BEGIN
    UPDATE rooms 
    SET member_count = member_count - 1 
    WHERE id = OLD.room_id;
END;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS after_user_joins_room;
DROP TRIGGER IF EXISTS after_user_leaves_room;
-- +goose StatementEnd
