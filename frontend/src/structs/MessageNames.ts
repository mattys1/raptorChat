export enum MessageTypes {
	SUBSCRIBE = "subscribe",
	UNSUBSCRIBE = "unsubscribe",
	CREATE = "create",
	DELETE = "delete",
	UPDATE = "update",
}

export enum MessageEvents {
	MESSAGE_SENT = "message_sent",
	MESSAGE_DELETED = "message_deleted",
	USERS = "users",
	CHATS = "chats",
	CHAT_MESSAGES = "chat_messages",
}
