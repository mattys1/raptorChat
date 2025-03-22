INSERT INTO rooms (name) VALUES ('Room1');
INSERT INTO rooms (name) VALUES ('Room2');

INSERT INTO users_rooms (user_id, room_id)
	SELECT users.id, rooms.id
	FROM users
	CROSS JOIN rooms;
