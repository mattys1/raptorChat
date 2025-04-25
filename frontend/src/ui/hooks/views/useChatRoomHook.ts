import { useResourceFetcher } from "../useResourceFetcher"
import { Message } from "../../../structs/models/Models"

export const useChatRoomHook = (key: number) => {
	const chatId = key
	console.log("ChatRoomHook key:", chatId)

	const [messageList] = useResourceFetcher<Message[]>([], `/api/rooms/${chatId}/messages`)

	return {
		messageList
	}
}

