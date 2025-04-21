import { useCallback, useEffect, useState } from "react";
import { SafeUnmarshall } from "../../logic/ProcessJSONResult";
import { Message, Resource } from "../../structs/Message";
import { MessageEvents, MessageTypes } from "../../structs/MessageNames";
import { find } from "rxjs";

export const useWebsocketListener = <T extends { id: number } /*hack*/>(eventName: MessageEvents, ws: WebSocket | null) => {
	const [data, setData] = useState<T[]>([]);

	 const messageHandler = useCallback((message: MessageEvent) => {
		const parsedResult = SafeUnmarshall<T>(message.data)

		if(parsedResult.isErr()) {
			console.error("Failed to parse message:", message.data, "Error:", parsedResult.error);
			return;
		}

		const parsed = parsedResult.value as unknown as Message<T>;
		console.log("message received:", parsed)

		const resource = parsed.contents as Resource<T>
		const contents = resource.contents as T[]

		switch(parsed.type) {
			case MessageTypes.CREATE: {
				if (resource.eventName === eventName) {
					console.log("Received CREATE message:", resource, eventName)
					setData((prev) => [...prev, ...contents || []])
				}
				break
			}
			case MessageTypes.UPDATE: {
				if(resource.eventName !== eventName) {
					console.error("Received UPDATE message for wrong event:", resource.eventName, eventName)
					return
				}

				console.log("Received UPDATE message:", resource, eventName)
				console.assert(contents.length % 2 == 0, "Update contents lenght is odd", contents)

				const old = contents.slice(0, contents.length / 2)
				const updated = contents.slice(contents.length / 2)

				setData(prev => prev.map((item) => {
					const updatedItem = updated.find(update => update.id === item.id);
					return updatedItem || item;
				}))

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
	] as const as [T[], React.Dispatch<React.SetStateAction<T[]>>] 
}
