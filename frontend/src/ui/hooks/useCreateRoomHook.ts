import { useEffect, useState } from "react"
import { WebsocketService } from "../../logic/websocket"
import { SubscriptionManager } from "../../logic/SubscriptionManager"
import { EventSender } from "../../logic/eventSender"

export const useCreateRoomHook = () => {
	const [socket, setSocket] = useState<WebSocket | null>(null)
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
		if (!socket) return;

		const subManager = new SubscriptionManager()

		return () => {
			subManager.cleanup()
		}
	})

	return {
		sender,
	}
}
