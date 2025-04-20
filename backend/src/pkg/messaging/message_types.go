package messaging

type MessageType string

const (
	MessageTypeSubscribe MessageType = "subscribe"
	MessageTypeUnsubscribe MessageType = "unsubscribe"
	MessageTypeUpdate MessageType = "update"
	MessageTypeDelete MessageType = "delete"
	MessageTypeCreate MessageType = "create"
)

type MessageEvent string

const (
	MessageEventChatMessages MessageEvent = "chat_messages"
	MessageEventUsers MessageEvent = "users"
	MessageEventRooms MessageEvent = "rooms"
	MessageEventInvites MessageEvent = "invites"
)
