import { err, Result, ResultAsync } from "neverthrow";
import { Resource, Message } from "../structs/Message";
import { MessageEvents, MessageTypes } from "../structs/MessageNames";
import { SafeMarshall } from "./ProcessJSONResult";
import { WebsocketService } from "./websocket";

export class EventSender {
	private async generateEvent<T>(type: MessageTypes, resource: Resource<T>): Promise<Result<void, Error>> {
		const message = {
			type: type,
			contents: resource
		} as Message<T>
		
		const marshalledResult = SafeMarshall(message);
		return await marshalledResult
			.asyncMap(marshalledData => WebsocketService.safeSend(marshalledData))
			.match(
				result => result,
				error => err(error)
			);
	}

	public async createResource<T>(resource: T[], event: MessageEvents): Promise<Result<void, Error>> {
		return this.generateEvent(MessageTypes.CREATE, {
			eventName: event,
			contents: resource
		} as Resource<T>)
	}

	public async deleteResource<T>(resource: T[], event: MessageEvents): Promise<Result<void, Error>> {
		return this.generateEvent(MessageTypes.DELETE, {
			eventName: event,
			contents: resource
		} as Resource<T>)
	}

	public async updateResource<T>(originalResource: T[], newResource: T[], event: MessageEvents): Promise<Result<void, Error>> {
		console.assert(originalResource.length === newResource.length, "Trying to update two resources, but their lengths don't match:", originalResource, newResource) as unknown

		return this.generateEvent(MessageTypes.UPDATE, {
			eventName: event,
			contents: originalResource.concat(newResource) 
		} as Resource<T>)
	}
}
