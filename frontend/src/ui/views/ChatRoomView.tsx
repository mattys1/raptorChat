import { useChatRoomHook } from "../hooks/useChatRoomHook";
import "./Start.css";

const ChatRoomView = () => {
	const props = useChatRoomHook()

	return (
		<>
			Chat Room test
			<input
				type="text"
				onChange={(e) => {}}
				placeholder="Enter text here"
			/>

		</>
	)
}

export default ChatRoomView
