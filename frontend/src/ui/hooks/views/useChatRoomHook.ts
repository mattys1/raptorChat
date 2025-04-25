import { useResourceFetcher } from "../useResourceFetcher"
import { Message } from "../../../structs/models/Models"
import { useSendEventMessage } from "../useSendEventMessage"

export const useChatRoomHook = (key: number) => {
	const chatId = key
	console.log("ChatRoomHook key:", chatId)

	const [messageList] = useResourceFetcher<Message[]>([], `/api/rooms/${chatId}/messages`)
	const [sentMessageStatus, error, sendChatMessage] = useSendEventMessage<Message>(`/api/rooms/${chatId}/messages`) 

	return {
		messageList,
		sentMessageStatus,
		sendChatMessage,
	}
}

