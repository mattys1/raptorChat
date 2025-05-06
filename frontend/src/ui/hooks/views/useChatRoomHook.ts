import { useResourceFetcher } from "../useResourceFetcher"
import { Message, Room } from "../../../structs/models/Models"
import { useSendEventMessage } from "../useSendEventMessage"
import { useFetchAndListen } from "../useFetchAndListen"
import { useCallback, useEffect } from "react"
import { useEventListener } from "../useEventListener"
import { useNavigate } from "react-router-dom"
import { ROUTES } from "../../routes"
import { usePresence } from "../usePresence"

type MessageUpdateCallback = (
  setState: React.Dispatch<React.SetStateAction<Message[]>>, 
  incoming: Message
) => void;

export const useChatRoomHook = (key: number) => {
	const navigate = useNavigate()
	const chatId = key
	console.log("ChatRoomHook key:", chatId)
	const [room, setRoom] = useResourceFetcher<Room | null>(null, `/api/rooms/${chatId}`) // TODO: merge this with useFetchAndListen
	const [sentMessageStatus, error, sendChatMessage] = useSendEventMessage<Message>(`/api/rooms/${chatId}/messages`) 

	// usePresence(`room:${chatId}`)
	const handleNewMessage = useCallback<MessageUpdateCallback>((setState, incoming) => {
		console.log("New message", incoming)
		setState((prev) => [...prev, incoming]);
	}, []);

	// const [messageList] = useResourceFetcher<Message[]>([], `/api/rooms/${chatId}/messages`)
	const [messageList] = useFetchAndListen<Message[], Message>(
		[],
		`/api/rooms/${chatId}/messages`,
		`room:${chatId}`,
		["message_sent"],	
		handleNewMessage
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

	const [response, roomDelErr, modifyRoom] = useSendEventMessage<Room>(`/api/rooms/${chatId}`)

	return {
		messageList,
		sentMessageStatus,
		sendChatMessage,
		modifyRoom,
		room,
	}
}

