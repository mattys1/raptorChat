import { useResourceFetcher } from "../useResourceFetcher"
import { Message, Room } from "../../../structs/models/Models"
import { useSendEventMessage } from "../useSendEventMessage"
import { useFetchAndListen } from "../useFetchAndListen"
import { useCallback, useEffect } from "react"
import { useEventListener } from "../useEventListener"
import { useNavigate } from "react-router-dom"
import { ROUTES } from "../../routes"

type MessageUpdateCallback = (
  setState: React.Dispatch<React.SetStateAction<Message[]>>, 
  incoming: Message
) => void;

export const useChatRoomHook = (key: number) => {
	const navigate = useNavigate()
	const chatId = key
	console.log("ChatRoomHook key:", chatId)

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
	// const [latest] = useEventListener<Room>(
	// 	`room:${chatId}`,
	// 	["room_deleted"]
	// )

	// useEffect(() => {
	// 	navigate(ROUTES.MAIN)
	// }, [latest])

	const [sentMessageStatus, error, sendChatMessage] = useSendEventMessage<Message>(`/api/rooms/${chatId}/messages`) 

	return {
		messageList,
		sentMessageStatus,
		sendChatMessage,
	}
}

