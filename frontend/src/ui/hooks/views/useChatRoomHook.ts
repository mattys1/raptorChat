import { useResourceFetcher } from "../useResourceFetcher"
import { Call, Message, Room } from "../../../structs/models/Models"
import { useSendEventMessage } from "../useSendEventMessage"
import { useFetchAndListen } from "../useFetchAndListen"
import { useCallback, useEffect } from "react"
import { useEventListener } from "../useEventListener"
import { useNavigate } from "react-router-dom"
import { ROUTES } from "../../routes"
import { HttpMethods, useSendResource } from "../useSendResource"

type MessageUpdateCallback = (
	setState: React.Dispatch<React.SetStateAction<Message[]>>, 
	incoming: Message,
	event: string
) => void;

type UserUpdateCallback = (
	setState: React.Dispatch<React.SetStateAction<number>>, 
	incoming: Room,
	event: string
) => void;

export const useChatRoomHook = (key: number) => {
	const navigate = useNavigate()
	const chatId = key
	console.log("ChatRoomHook key:", chatId)
	const [room, setRoom] = useResourceFetcher<Room | null>(null, `/api/rooms/${chatId}`) // DODO: merge this with useFetchAndListen
	const [, , notifyOnCallJoin] = useSendResource<null>(`/api/rooms/${chatId}/calls/joined`, HttpMethods.POST)

	const [calls] = useFetchAndListen<Call[], Call>(
		[],
		`/api/rooms/${chatId}/calls`,
		`room:${chatId}`,
		["call_created", "call_completed", "call_updated"],
		(setState, incoming, event) => {
			switch(event) {
				case "call_created":
					setState((prev) => [...prev, incoming]);
					break;
				case "call_completed":
				case "call_udpated":
					setState((prev) => prev.map(call => { return call.id === incoming.id ? incoming : call }));
					break;
				default:
					console.warn(`Unhandled call event: ${event}`);
					break;
			}
		}
	)

	const [sentMessageStatus,, sendChatMessageAction] = useSendEventMessage<Message>(`/api/rooms/${chatId}/messages`) 

	// usePresence(`room:${chatId}`)
	const handleMessageAction = useCallback<MessageUpdateCallback>((setState, incoming, event) => {
		switch (event) {
			case "message_sent":
				setState((prev) => [...prev, incoming]);
				break
			case "message_deleted":
				setState((prev) => prev.filter((msg) => msg.id !== incoming.id));
				break
			

		}
	}, []);

	const handleUserCount = useCallback<UserUpdateCallback>((setState, incoming, event) => {
		console.log("handle user count", incoming, event)
		switch(event) {
			case "user_joined":
				setState((prev) => prev + 1);
				break;
			case "user_left":
				setState((prev) => prev - 1);
				break;
			default:
				break;
		}	
	}, [])

	// const [messageList] = useResourceFetcher<Message[]>([], `/api/rooms/${chatId}/messages`)
	const [memberCount] = useFetchAndListen<number, Room>(
		0,
		`/api/rooms/${chatId}/user/count`,
		`room:${chatId}`,
		["user_joined", "user_left"],
		handleUserCount,
	)
	const [messageList] = useFetchAndListen<Message[], Message>(
		[],
		`/api/rooms/${chatId}/messages`,
		`room:${chatId}`,
		["message_sent", "message_deleted"],	
		handleMessageAction
	)
	const [latest] = useEventListener<Room>(
		`room:${chatId}`,
		["room_deleted", "room_updated"]
	)

	useEffect(() => {
		switch(latest.event) {
			case "room_deleted":
				navigate(ROUTES.MAIN)
				break
			case "room_updated":
				setRoom(latest.item)	
		} 
	}, [latest])

	const [,, createRoomEvent] = useSendEventMessage<Room>(`/api/rooms/${chatId}`)

	return {
		messageList,
		sentMessageStatus,
		sendChatMessageAction,
		createRoomEvent,
		room,
		memberCount,
		calls,
		notifyOnCallJoin,
	}
}

