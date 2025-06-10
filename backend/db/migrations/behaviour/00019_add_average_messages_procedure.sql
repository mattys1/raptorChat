-- +goose Up
-- +goose StatementBegin
CREATE PROCEDURE sp_daily_message_counts(
    IN p_start_date DATETIME,
    IN p_end_date   DATETIME
)
BEGIN
  IF p_start_date IS NULL THEN
    SET p_start_date = '1970-01-01 00:00:00';
  END IF;
  IF p_end_date IS NULL THEN
    SET p_end_date = NOW();
  END IF;

  SELECT
    DATE(m.created_at)      AS message_date,
    COUNT(*)                AS messages_count
  FROM messages m
  WHERE m.created_at BETWEEN p_start_date AND p_end_date
  GROUP BY DATE(m.created_at)
  ORDER BY DATE(m.created_at);

  SELECT
    ROUND(
      (
        SELECT COUNT(*) 
        FROM messages 
        WHERE created_at BETWEEN p_start_date AND p_end_date
      )
      /
      (DATEDIFF(DATE(p_end_date), DATE(p_start_date)) + 1),
    2
    ) AS average_messages_per_day;
END;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP PROCEDURE IF EXISTS sp_daily_message_counts;
-- +goose StatementEnd