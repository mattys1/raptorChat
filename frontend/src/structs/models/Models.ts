export interface Message {
	id: number;
	sender_id: number;
	room_id: number;
	contents: string;
	created_at: Date;
}

export interface Room {
	id: number;
	name: string | null;
}

export interface User {
	id: number;
	username: string;
	email: string;
	created_at: Date;
}

export interface UsersRoom {
	user_id: number;
	room_id: number;
}
