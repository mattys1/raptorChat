-- +goose Up
-- +goose StatementBegin
CREATE TRIGGER username_validation_trigger
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  IF NEW.username REGEXP '[:$#]' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Username contains disallowed characters. The following characters are not allowed: :, $, #';
  END IF;
END;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS username_validation_trigger;
-- +goose StatementEnd
