import { useParams } from "react-router-dom";
import { useChatRoomHook } from "../hooks/views/useChatRoomHook";
import "./Start.css";
import { MessageEvents } from "../../structs/MessageNames";
import { Message } from "../../structs/models/Models";
import { EventResource } from "../../structs/Message";

const ChatRoomView = () => {
	const key = Number(useParams().chatId)

	const props = useChatRoomHook(key)
	// console.log("ChatRoomView props:", props)
	console.log("ChatRoomView message", props.messageList)
	console.log("Rerendered")

	return (
		<>
			Chat Room test
			<p>
				{props?.messageList?.map((message, index) => (
					<li key={index}>
						{message?.contents ?? "Unknown text"} { }
						Sender: {message?.sender_id ?? "Unknown sender"}
					</li>
				))}
			</p>

			<form onSubmit={(e) => {
				e.preventDefault()
				const formData = new FormData(e.currentTarget)
				const message = formData.get("messageBox")?.toString() ?? ""
				console.log("Message:", message)

				props.sendChatMessage({
					channel: `room:${key}`,
					method: "POST",
					event_name: MessageEvents.MESSAGE_SENT,
					contents: {
						id: 0,
						room_id: key,
						sender_id: 0,
						contents: message,

					} 
				} as EventResource<Message>)

				e.currentTarget.reset();
			}}>
				<input name="messageBox" />
				<button type="submit">
					Wyslij pan
				</button>
			</form> 
		</>
	)
}

export default ChatRoomView
