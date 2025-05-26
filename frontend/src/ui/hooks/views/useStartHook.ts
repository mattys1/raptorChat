import { useState } from "react";

import { Subscription } from "centrifuge";

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
	const [isConnected] = useState(false);
	const [] = useState<Subscription | null>(null);

	return { isConnected };
};
