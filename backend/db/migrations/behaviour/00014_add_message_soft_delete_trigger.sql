-- +goose Up
-- +goose StatementBegin
CREATE TRIGGER message_soft_delete_trigger
BEFORE UPDATE ON messages
FOR EACH ROW
BEGIN
    SET NEW.content = CONCAT('[Message deleted at ', DATE_FORMAT(CURRENT_TIMESTAMP, '%Y-%m-%d %H:%i:%s'), ']');

    SET NEW.deleted_at = CURRENT_TIMESTAMP;
END;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS message_soft_delete_trigger;
-- +goose StatementEnd
