export interface Message {
	id: number;
	sender_id: number;
	room_id: number;
	contents: string;
	created_at: Date;
}

export const RoomsType = {
	Direct: "direct",
	Group: "group"
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

export const InvitesState = {
	Pending: "pending",
	Accepted: "accepted",
	Declined: "declined"
} as const;

export type InvitesState = typeof InvitesState[keyof typeof InvitesState];

const InvitesType = {
	Direct: "direct",
	Group: "group"
} as const;

export type InvitesType = typeof InvitesType[keyof typeof InvitesType];

export interface Invite {
	id: number;
	type: InvitesType;
	state: InvitesState;
	room_id: number | null;
	issuer_id: number;
	receiver_id: number;
}
