import { useEffect, useState } from "react"
import { WebsocketService } from "../../logic/websocket"
import { SubscriptionManager } from "../../logic/SubscriptionManager"
import { MessageEvents } from "../../structs/MessageNames"
import { useWebsocketListener } from "./useWebsocketListener"

export const useInviteToChatroomHook = () => {
	const [socket, setSocket] = useState<WebSocket | null>(null)
	const invites, setInvites] = useWebsocketListener<>

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
		subManager.subscribe(MessageEvents.INVITES)

		return () => {
			subManager.cleanup()
		}
	})
}
