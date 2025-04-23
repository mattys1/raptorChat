import { useEffect, useState } from "react";

import { WebsocketService } from "../../logic/websocket";
import { SubscriptionManager } from "../../logic/SubscriptionManager";
import { User } from "../../structs/models/Models";
import { MessageEvents } from "../../structs/MessageNames";
import { useWebsocketListener } from "./useWebsocketListener";
import { Centrifuge } from "centrifuge";
import { publish } from "rxjs";

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
	const [test, setTest] = useState<unknown>(null);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		// 1. Instantiate client
		const centrifuge = new Centrifuge("ws://localhost:8000/connection/websocket", {
			token: localStorage.getItem("token") || "",
			debug: true,
		});

		// 2. New subscription object
		const sub = centrifuge.newSubscription("test");

		sub.on("subscribed", (ctx) => {
			console.log("Subscribed to channel", ctx);
		})

		sub.on("publication", (ctx) => {
			console.log("New publication", ctx);
			setTest(ctx.data);
		})

		centrifuge.on("connected", (ctx) => {
			console.log("Connected to Centrifuge", ctx);
			setIsConnected(true);
			sub.subscribe();
		});
		centrifuge.connect();

		return () => {
			sub.unsubscribe();
			centrifuge.disconnect();
		};
	}, []);

	return { test, isConnected };
};
