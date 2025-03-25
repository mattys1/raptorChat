-- +goose Up
-- +goose StatementBegin
INSERT INTO users (username, email) VALUES ('DonaldTusk', 'donald@onet.pl');
-- +goose StatementEnd
-- +goose StatementBegin
INSERT INTO users (username, email) VALUES ('JaroslawKaczynski', 'jarosik@interia.pl');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM users WHERE email IN ('donald@onet.pl', 'jarosik@interia.pl');
-- +goose StatementEnd
