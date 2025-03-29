export const useStartHook = () => {
	const setupWebSocket = () => {
		const ws = new WebSocket("ws://localhost:8080/ws");

		ws.onopen = async () => {
			console.log("WebSocket connection established.");
			const subscription = {
				type: "subscribe",
				contents: "chat_messages"
			}
			ws.send(JSON.stringify(subscription));
		}

		ws.onmessage = async (event) => {
			console.log("WebSocket message received:", event.data);
		}
	};


	return {
		socket: setupWebSocket()
	}
}
