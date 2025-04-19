export interface Message {
	id: number;
	sender_id: number;
	room_id: number;
	contents: string;
	created_at: Date;
}

export const RoomsType = {
  direct: "direct",
  group: "group",
} as const;

export type RoomsType = typeof RoomsType[keyof typeof RoomsType];

export interface Room {
	id: number;
	name: string | null;
	owner_id: number | null;
	type: RoomsType;
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
