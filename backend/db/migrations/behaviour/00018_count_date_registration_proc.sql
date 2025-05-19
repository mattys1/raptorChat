-- +goose Up
-- +goose StatementBegin
CREATE PROCEDURE user_registrations (
    IN  p_start DATETIME,
    IN  p_end   DATETIME
)
BEGIN
    IF p_start IS NULL THEN
        SELECT COALESCE(MIN(created_at), '1970-01-01 00:00:00')
          INTO p_start
          FROM users;
    END IF;

    IF p_end IS NULL THEN
        SET p_end = NOW();
    END IF;

    SELECT
        DATE(created_at) AS date_of_signup,
        COUNT(*)         AS signups_number
    FROM users
    WHERE created_at BETWEEN p_start AND p_end
    GROUP BY DATE(created_at)
    ORDER BY signups_number;
END;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP PROCEDURE IF EXISTS user_registrations;
-- +goose StatementEnd