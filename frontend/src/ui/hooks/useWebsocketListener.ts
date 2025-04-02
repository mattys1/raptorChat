import { useCallback, useEffect, useState } from "react";
import { SafeUnmarshall } from "../../logic/ProcessJSONResult";
import { Message, Resource } from "../../types/Message";
import { MessageEvents, MessageTypes } from "../../types/MessageNames";

export const useWebsocketListener = <T>(eventName: MessageEvents, ws: WebSocket | null) => {
	const [data, setData] = useState<T[]>([]);

	 const messageHandler = useCallback((message: MessageEvent) => {
		const parsedResult = SafeUnmarshall<T>(message.data)

		if(parsedResult.isErr()) {
			console.error("Failed to parse message:", message.data, "Error:", parsedResult.error);
			return;
		}

		const parsed = parsedResult.value as Message<T>;

		switch(parsed.type) {
			case MessageTypes.CREATE: {
				const resource = parsed.contents as Resource<T>
				const contents = resource.contents as T[]

				if (resource.eventName === eventName) {
					setData((prev) => [...prev, ...contents])
				}
				break
			}
			case MessageTypes.SUBSCRIBE: {
				console.assert(false, "Server should never subscribe to the client")
				break
			}
			case MessageTypes.UNSUBSCRIBE: {
				console.assert(false, "Server should never unsubscribe to the client")
				break
			}
			default: {
				console.error("Unknown message type:", parsed.type);
			}
		}
	},[eventName])

	useEffect(() => {
		ws?.addEventListener("message", messageHandler)
		return () => {
			ws?.removeEventListener("message", messageHandler)
		}
	})

	return [
		data,
		setData
	]
}
