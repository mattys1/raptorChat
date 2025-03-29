import { useEffect, useState } from "react";

import { WebsocketService } from "../../logic/websocket";

export const useMainHook = () => {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [isConnecting, setIsConnecting] = useState(true);
	const [error, setError] = useState<Error | null>(null);

		const setupWebSocket = async () => {
			setIsConnecting(true);
			const ws = WebsocketService.getInstance();

			if(ws.isErr()) {
				console.error("Failed to create WebSocket instance:", ws.error);
				setError(ws.error);
			} else {
				console.log("WebSocket instance created:", ws.value);

				ws.value.onopen = async () => {
					console.log("WebSocket connection established.");
					const subscription = {
						type: "subscribe",
						contents: "chat_messages"
					}
					ws.value.send(JSON.stringify(subscription));
				}

				ws.value.onmessage = async (event) => {
					console.log("WebSocket message received:", event.data);
				}

				setSocket(ws.value);
			}

			setIsConnecting(false);
		};

	useEffect(() => {
		setupWebSocket();
	}, [])

	return {
		socket,
		isConnecting,
		error
	}
};


