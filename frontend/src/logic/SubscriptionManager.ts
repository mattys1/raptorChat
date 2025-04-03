import { Result, ok, err } from "neverthrow"
import { SafeMarshall, SafeUnmarshall } from "./ProcessJSONResult"
import { MessageEvents, MessageTypes as MessageType } from "../types/MessageNames"
import { Message, Resource } from "../types/Message"
import { User } from "../types/models/Models"
import { WebsocketService } from "./websocket"

export class SubscriptionManager {
	private ws: WebSocket
	private subscriptions: Map<MessageEvents, number[]> = new Map()

	private sendToServer(event: MessageEvents, targetIds: number[], type: MessageType): Error | null {
		const message: Message = {
			type: type,
			contents: {
				eventName: event,
				targetIds: targetIds
			}
		}

		const payload = SafeMarshall(message)

		if(payload.isErr()) {
			return payload.error
		}

		console.log("Sending payload:", payload.value)

		WebsocketService.safeSend(payload.value)
		return null
	}

	// TODO: sendToServer should actually be async since it's being called multiple times
	private async unsubscribeAll() { 		
		this.subscriptions.forEach((targetIds, event) => {
			console.log(this.constructor.name, "Unsubscribing from", event)
			this.sendToServer(event, targetIds, MessageType.UNSUBSCRIBE)
		})
	}

	public constructor(ws: WebSocket) {
		this.ws = ws
	}
	

	public async subscribe(
		event: MessageEvents, 
		targetId: number[] = [-1]
	): Promise<Result<boolean, Error>> {
		console.log("Calling subscribe")
		if(this.subscriptions.has(event)) {
			return ok(false)
		}
		this.subscriptions.set(event, targetId)

		const error = this.sendToServer(event, targetId, MessageType.SUBSCRIBE)
		if(error) {
			this.subscriptions.delete(event)
			return err(error)
		}

		return ok(true)
	}

	public cleanup() {
		this.unsubscribeAll()
		this.subscriptions.clear()
	}
}
