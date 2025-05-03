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
	const [latest] = useEventListener<any>(
		`room:${chatId}`,
		["room_deleted"]
	)

	useEffect(() => {
		if(latest.event === "room_deleted") { //FIXME: somehow this can be not a room_deleted event
			navigate(ROUTES.MAIN)
		}
	}, [latest])

	const [response, roomDelErr, deleteRoom] = useSendEventMessage<Room>(`/api/rooms/${chatId}`)
	const [room] = useResourceFetcher<Room | null>(null, `/api/rooms/${chatId}`)
	const [sentMessageStatus, error, sendChatMessage] = useSendEventMessage<Message>(`/api/rooms/${chatId}/messages`) 

	return {
		messageList,
		sentMessageStatus,
		sendChatMessage,
		deleteRoom,
		room,
	}
}

