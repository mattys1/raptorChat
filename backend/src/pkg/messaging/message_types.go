package messaging

type MessageType string

const (
	MessageTypeSubscribe MessageType = "subscribe"
	MessageTypeUpdate MessageType = "update"
	MessageTypeDelete MessageType = "delete"
	MesssageTypeCreate MessageType = "create"
)

type MessageEvent string

const (
	MessageEventChatMessages MessageEvent = "chat_messages"
)
