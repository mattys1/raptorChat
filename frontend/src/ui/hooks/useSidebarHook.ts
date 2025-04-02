import { useEffect, useState } from "react"
import { WebsocketService } from "../../logic/websocket"
import { SubscriptionManager } from "../../logic/SubscriptionManager"
import { MessageEvents } from "../../types/MessageNames"
import { Room } from "../../types/models/Models"
import { useWebsocketListener } from "./useWebsocketListener"

export const useSidebarHook = () => {
	const [socket, setSocket] = useState<WebSocket | null>(null)
	const [chats, setChats] = useWebsocketListener<Room>(MessageEvents.CHATS, socket)

	const setUpSocket = async () => {
		const socket = WebsocketService.getInstance().unwrapOr(null)
		console.log("Socket:", socket)
		setSocket(socket)
	}

	useEffect(() => {
		setUpSocket()
	}, [])

	useEffect(() => {
		if (!socket) return;

		const subManager = new SubscriptionManager(socket)
		subManager.subscribe(MessageEvents.CHATS)

		return () => subManager.cleanup()
	}, [socket])

	return {
		socket,
		chats,
		setChats
	}

}
