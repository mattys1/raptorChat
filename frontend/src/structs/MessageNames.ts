export const MessageTypes = {
	SUBSCRIBE: "subscribe",
	UNSUBSCRIBE: "unsubscribe",
	CREATE: "create",
	DELETE: "delete",
	UPDATE: "update",
} as const;

export type MessageTypes = typeof MessageTypes[keyof typeof MessageTypes];

export const MessageEvents = {
	MESSAGES: "messages",
	USERS: "users",
	ROOMS: "rooms",
	CHAT_MESSAGES: "chat_messages",
} as const;

export type MessageEvents = typeof MessageEvents[keyof typeof MessageEvents];
