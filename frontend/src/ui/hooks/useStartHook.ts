import { useEffect, useState } from "react";

import { WebsocketService } from "../../logic/websocket";
import { SubscriptionManager } from "../../logic/SubscriptionManager";
import { User } from "../../types/models/Models";
import { MessageEvents } from "../../types/MessageNames";
import { useWebsocketListener } from "./useWebsocketListener";

export const useMainHook = () => {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [isConnecting, setIsConnecting] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	// const [users, setUsers] = useState<User[]>([])
	const [users, setUsers] = useWebsocketListener<User>(MessageEvents.USERS, socket)

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
		subManager.subscribe(MessageEvents.USERS)

		return () => {
			subManager.cleanup()
		}
	}, [socket])

	return {
		socket,
		isConnecting,
		error,
		users,
		setUsers
	}
};


