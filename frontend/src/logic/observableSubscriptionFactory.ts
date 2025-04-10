import { Observable, Observer } from "rxjs";
import { MessageEvents, MessageTypes } from "../types/MessageNames";
import { SafeUnmarshall } from "./ProcessJSONResult";
import { Result } from "neverthrow";
import { Message, Resource } from "../types/Message";
import { WebSocketMessage } from "rxjs/internal/observable/dom/WebSocketSubject";

// function newState<T>(setState: React.Dispatch<React.SetStateAction<T[]>>, newVal: T[], replaceWithFunc: (prev: T[]) => next: T[]) {
// 	setState((prev) => {
//
//
// 		return prev
// 	})
// }

export function observableSubscriptionFactory<T>(
	state: T,
	setState: React.Dispatch<React.SetStateAction<T[]>>,
	eventName: MessageEvents,
	socket: WebSocket,
): [Observable<T>, Observer<T>] {

	const observer: Observer<T[]> =  {
		next: (newVal: T[]) => { console.log("Setting value in response to event:", eventName ); newState(setState, newVal) },
		error: (error: Error) => { console.error(error) },
		complete: () => { console.log("Completed receiving users") },
	}

	const messageHandler = (message: MessageEvent) => {
		const decoded  = SafeUnmarshall(message.data) as Result<Message<T>, Error>
		if(decoded.isErr()) {
			observer.error(decoded.error)
			return
		}

		switch(decoded.value.type) {
			case MessageTypes.CREATE: {
				const messageTyped = decoded.value.contents as Resource<T>
				console.log(messageTyped)

				if(messageTyped.eventName === eventName) {
					console.log(messageTyped.contents)
					observer.next(
						messageTyped.contents
					)
				}
			}
		}

	}


	const usersObservable = new Observable<T[]>(() => {
		socket.addEventListener("message", messageHandler)  
		return () => socket.removeEventListener("message", messageHandler)
	})
}
