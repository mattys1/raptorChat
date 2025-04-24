import { useEffect, useState } from "react"
// import { WebsocketService } from "../../logic/websocket"
// import { SubscriptionManager } from "../../logic/SubscriptionManager"
import { useWebsocketListener } from "./useWebsocketListener"
import { MessageEvents } from "../../structs/MessageNames"
import { useParams } from "react-router-dom"
import { Message } from "../../structs/models/Models"
// import { EventSender } from "../../logic/eventSender"

export const useChatRoomHook = (key: number) => {
	const chatId = key
	console.log("ChatRoomHook key:", chatId)

	const messageList = useState<Message[]>([])

	return {
		messageList
	}
}
