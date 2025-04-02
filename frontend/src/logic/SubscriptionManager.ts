import { Result, ok, err } from "neverthrow"
import { SafeMarshall, SafeUnmarshall } from "./ProcessJSONResult"
import { MessageEvents, MessageTypes as MessageType } from "../types/MessageNames"
import { Message, Resource } from "../types/Message"
import { User } from "../types/models/Models"
import { WebsocketService } from "./websocket"

export class SubscriptionManager {
	private ws: WebSocket
	private subscriptions: Map<MessageEvents, boolean> = new Map()

	private sendToServer(event: MessageEvents, type: MessageType): Error | null {
		const payload = SafeMarshall({
			type: type,
			contents: event
		})

		if(payload.isErr()) {
			return payload.error
		}

		console.log("Sending payload:", payload.value)

		WebsocketService.safeSend(payload.value)
		return null
	}

	// FIXME: sendToServer should actually be async since it's being called multiple times
	private async unsubscribeAll() { 		
		console.log("Unsubscribing all:", this.subscriptions)
		this.subscriptions.forEach((_, event) => {
			this.sendToServer(event, MessageType.UNSUBSCRIBE)
		})
	}

	public constructor(ws: WebSocket) {
		this.ws = ws
	}
	

	public async subscribe<T>(
		event: MessageEvents, 
	): Promise<Result<boolean, Error>> {
		console.log("Calling subscribe")
		if(this.subscriptions.has(event)) {
			return ok(false)
		}
		this.subscriptions.set(event, true)

		const error = this.sendToServer(event, MessageType.SUBSCRIBE)
		if(error) {
			this.subscriptions.delete(event)
			return err(error)
		}

		this.ws.onmessage = (message) => {
			const decoded = SafeUnmarshall<Message<T>>(message.data)
			if(decoded.isErr()) {
				console.error("Message is error" + message.data)
				return
			}

			console.log("Decoded:", decoded)
			if(decoded.value.type == MessageType.CREATE) {
				const resource = decoded.value.contents as Resource<T>
			}
		}

		console.log("Subscribed to", event)

		return ok(true)
	}

	public cleanup() {
		this.unsubscribeAll()
		this.subscriptions.clear()
	}
}
