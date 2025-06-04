-- +goose Up
-- +goose StatementBegin
ALTER TABLE calls 
	ADD COLUMN ended_at TIMESTAMP NULL DEFAULT NULL,
	ADD COLUMN peak_participant_count INT UNSIGNED DEFAULT 1 NOT NULL,	
	MODIFY COLUMN status enum('active', 'completed', 'rejected') DEFAULT 'active' NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE calls 
	DROP COLUMN ended_at,
	DROP COLUMN peak_participant_count,
	MODIFY COLUMN status enum('active', 'completed', 'rejected') NOT NULL;
-- +goose StatementEnd

