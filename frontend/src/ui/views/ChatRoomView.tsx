import { useParams } from "react-router-dom";
import { useChatRoomHook } from "../hooks/useChatRoomHook";
import "./Start.css";
import { MessageEvents } from "../../structs/MessageNames";
import { Message } from "../../structs/models/Models";

const ChatRoomView = () => {
	const key = Number(useParams().chatId)

	const props = useChatRoomHook(key)
	// console.log("ChatRoomView props:", props)
	console.log("ChatRoomView message", props.messageList)

	return (
		<>
			Chat Room test
			<p>
				{props.messageList?.map((message, index) => (
					<li key={index}>
						{message.contents ?? "Unknown text"} .
						Sender: {message.sender_id ?? "Unknown sender"}
					</li>
				))}
			</p>

			<form action={(input) => {
				const message = input.get("messageBox")?.toString()
				props.sender.createResource([{
						id: 0,
						sender_id: 0,
						room_id: key,
						contents: message ?? "Unknown",
						created_at: new Date(Date.now())
				}] as Message[], MessageEvents.CHAT_MESSAGES)
			}}>
				<input name="messageBox" />
				<button>Wyslij pan</button>
			</form> 
		</>
	)
}

export default ChatRoomView
