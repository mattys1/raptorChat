-- +goose Up
-- +goose StatementBegin
CREATE TRIGGER update_peak_member_count BEFORE UPDATE ON calls
FOR EACH ROW
    BEGIN
        IF NEW.participant_count > OLD.peak_participant_count THEN
            SET NEW.peak_participant_count = NEW.participant_count;
        END IF;
    END;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER update_peak_member_count;
-- +goose StatementEnd
