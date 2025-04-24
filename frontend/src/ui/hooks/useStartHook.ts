import { useEffect, useState } from "react";

import { WebsocketService } from "../../logic/websocket";
import { SubscriptionManager } from "../../logic/SubscriptionManager";
import { User } from "../../structs/models/Models";
import { MessageEvents } from "../../structs/MessageNames";
import { useWebsocketListener } from "./useWebsocketListener";
import { Centrifuge } from "centrifuge";
import { publish } from "rxjs";
import { CentrifugoService } from "../../logic/CentrifugoService";
import { Subscription } from "centrifuge";
import { useEventListener } from "../../logic/useEventListener";

export const useMainHook = () => {
	// const [socket, setSocket] = useState<WebSocket | null>(null);
	// const [isConnecting, setIsConnecting] = useState(true);
	// const [error, setError] = useState<Error | null>(null);
	// // const [users, setUsers] = useState<User[]>([])
	// const [users, setUsers] = useWebsocketListener<User>(MessageEvents.USERS, socket)
	//
	// const setUpSocket = async () => {
	// 	const socket = WebsocketService.getInstance().unwrapOr(null)
	// 	console.log("Socket:", socket)
	// 	setSocket(socket)
	// }
	//
	// useEffect(() => {
	// 	setUpSocket()
	// }, [])
	//
	// useEffect(() => {
	// 	if (!socket) return;
	//
	// 	const subManager = new SubscriptionManager()
	// 	subManager.subscribe(MessageEvents.USERS)
	//
	// 	return () => {
	// 		subManager.cleanup()
	// 	}
	// }, [socket])
	//
	// return {
	// 	socket,
	// 	isConnecting,
	// 	error,
	// 	users,//: users.flatMap(usersActualArray => usersActualArray),
	// 	setUsers,
	// }
	const test = useEventListener<string>("test", "test", (setState, incoming) => { setState(incoming) });
	const [isConnected, setIsConnected] = useState(false);
	const [sub, setSub] = useState<Subscription | null>(null);

	return { test, isConnected };
};
