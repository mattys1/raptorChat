import { useParams } from "react-router-dom";
import { useChatRoomHook } from "../hooks/useChatRoomHook";
import "./Start.css";
import { MessageEvents } from "../../structs/MessageNames";
import { Message } from "../../structs/models/Models";

const ChatRoomView = () => {
	const key = Number(useParams().chatId)

	const props = useChatRoomHook(key)
	// console.log("ChatRoomView props:", props)
	// console.log("ChatRoomView message", props.messageList)

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
			}}>
				<input name="messageBox" />
				<button>Wyslij pan</button>
			</form> 
		</>
	)
}

export default ChatRoomView
