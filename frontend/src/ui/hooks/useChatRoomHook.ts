import { useEffect, useState } from "react"
import { WebsocketService } from "../../logic/websocket"
import { SubscriptionManager } from "../../logic/SubscriptionManager"
import { useParams } from "react-router-dom"

export const useChatRoomHook = () => {
	const chatId = Number(useParams().chatId)

	const [socket, setSocket] = useState<WebSocket | null>(null)

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

		return () => {
			subManager.cleanup()
		}
	})
}
