import { useParams } from "react-router-dom";
import { useChatRoomHook } from "../hooks/useChatRoomHook";
import "./Start.css";

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

			<input
				type="text"
				onChange={(e) => {}}
				placeholder="Enter text here"
			/>

		</>
	)
}

export default ChatRoomView
