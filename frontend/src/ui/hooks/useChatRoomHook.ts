import { useEffect, useState } from "react"
// import { WebsocketService } from "../../logic/websocket"
// import { SubscriptionManager } from "../../logic/SubscriptionManager"
import { useWebsocketListener } from "./useWebsocketListener"
import { MessageEvents } from "../../structs/MessageNames"
import { useParams } from "react-router-dom"
import { Message } from "../../structs/models/Models"
// import { EventSender } from "../../logic/eventSender"

export const useChatRoomHook = (key: number) => {
	const chatId = key
	console.log("ChatRoomHook key:", chatId)

	const [socket, setSocket] = useState<WebSocket | null>(null)
	const [messageList, setMessages] = useWebsocketListener<Message>(MessageEvents.CHAT_MESSAGES, socket)
	const sender = new EventSender

	const setUpSocket = async () => {
		const socket = WebsocketService.getInstance().unwrapOr(null)
		console.log("Socket:", socket)
		setSocket(socket)
	}

	useEffect(() => {
		setUpSocket()
	}, [])

	useEffect(() => {
		setMessages([])
	}, [chatId])

	useEffect(() => {
		if (!socket) return;

		const subManager = new SubscriptionManager()
		subManager.subscribe(MessageEvents.CHAT_MESSAGES, [chatId])

		return () => {
			subManager.cleanup()
		}
	}, [socket, chatId])

	return {
		sender,
		messageList: messageList.filter(msg => msg.room_id === chatId), //is this fine? feels like filtering should be done somewhere else
		setMessages,
	}
}
