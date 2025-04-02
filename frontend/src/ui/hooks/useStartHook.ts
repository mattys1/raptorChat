import { useEffect, useState } from "react";

import { WebsocketService } from "../../logic/websocket";
import { SubscriptionManager } from "../../logic/SubscriptionManager";
import { User } from "../../types/models/Models";
import { MessageEvents, MessageTypes } from "../../types/MessageNames";
import { AsyncSubject, Observable, Observer, Subject } from "rxjs";
import { Message, Resource } from "../../types/Message";
import { SafeUnmarshall } from "../../logic/ProcessJSONResult";
import { Result } from "neverthrow";

export const useMainHook = () => {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [isConnecting, setIsConnecting] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [users, setUsers] = useState<User[]>([])

	const setUpSocket = async () => {
		const socket = WebsocketService.getInstance().unwrapOr(null)
		console.log("Socket:", socket)
		setSocket(socket)
	}
	
	useEffect(() => {
		setUpSocket()
	}, [])

	useEffect(() => {
		if(!socket) { // TODO: implement a isReady function in WebsocketService or better yet a safeSend function that checks for readyness
			console.warn("Socket is null")
			return
		}

		const subManager = new SubscriptionManager(
			socket
		)

		subManager.subscribe(MessageEvents.USERS)

		console.log("effect running")
		const observer: Observer<User[]> =  {
			next: (users: User[]) => { console.log(users); setUsers(users) },
			error: (error: Error) => { console.error(error) },
			complete: () => { console.log("Completed receiving users") },
		}

		const usersObservable = new Observable<User[]>((observer) => {
			socket.onmessage = (message) => {
				const decoded  = SafeUnmarshall(message.data) as Result<Message<User>, Error>
				if(decoded.isErr()) {
					observer.error(decoded.error)
					return
				}

				switch(decoded.value.type) {
					case MessageTypes.CREATE: {
						const messageTyped = decoded.value.contents as Resource<User>
						console.log(messageTyped)

						switch(messageTyped.eventName) {
							case MessageEvents.USERS: {
								console.log(messageTyped.contents)
								observer.next(
									messageTyped.contents
								)
							}
						}

					}
				}
			}
			
			
			return () => {
				observer.complete()
				console.log("Observable cleanup should be handled here")
			}
		})

		usersObservable.subscribe(observer)

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


