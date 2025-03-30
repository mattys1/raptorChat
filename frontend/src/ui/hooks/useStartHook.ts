import { useEffect, useState } from "react";

import { WebsocketService } from "../../logic/websocket";
import { SubscriptionManager } from "../../logic/SubscriptionManager";
import { User } from "../../types/models/Models";
import { MessageEvents } from "../../types/MessageNames";

export const useMainHook = () => {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [isConnecting, setIsConnecting] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [users, setUsers] = useState<User[]>([])

		const setupWebSocket = async () => {
			setIsConnecting(true);
			const ws = WebsocketService.getInstance();

			if(ws.isErr()) {
				console.error("Failed to create WebSocket instance:", ws.error);
				setError(ws.error);
			} else {
				console.log("WebSocket instance created:", ws.value);

				ws.value.onopen = () => {
					const manager = new SubscriptionManager(ws.value)
					manager.subscribe<User>(MessageEvents.USERS, users, setUsers)
				}

				setSocket(ws.value);
			}

			setIsConnecting(false);
		};

	useEffect(() => {
		setupWebSocket();

		return () => {

		}
	}, [])

	return {
		socket,
		isConnecting,
		error,
		users,
		setUsers
	}
};


