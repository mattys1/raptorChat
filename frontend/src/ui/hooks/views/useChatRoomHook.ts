import { useResourceFetcher } from "../useResourceFetcher"
import { Message } from "../../../structs/models/Models"
import { useSendEventMessage } from "../useSendEventMessage"
import { useFetchAndListen } from "../useFetchAndListen"
import { useCallback } from "react"

type MessageUpdateCallback = (
  setState: React.Dispatch<React.SetStateAction<Message[]>>, 
  incoming: Message
) => void;

export const useChatRoomHook = (key: number) => {
	const chatId = key
	console.log("ChatRoomHook key:", chatId)

	const handleNewMessage = useCallback<MessageUpdateCallback>((setState, incoming) => {
		setState((prev) => [...prev, incoming]);
	}, []);

	// const [messageList] = useResourceFetcher<Message[]>([], `/api/rooms/${chatId}/messages`)
	const [messageList] = useFetchAndListen<Message[], Message>(
		[],
		`/api/rooms/${chatId}/messages`,
		`room:${chatId}`,
		"message_sent",	
		handleNewMessage
	)
	const [sentMessageStatus, error, sendChatMessage] = useSendEventMessage<Message>(`/api/rooms/${chatId}/messages`) 

	return {
		messageList,
		sentMessageStatus,
		sendChatMessage,
	}
}

