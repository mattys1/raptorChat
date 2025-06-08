import { Message } from "../../structs/models/Models";
import defaultawatar from "../assets/defaultavatar/defaultavatar.jpg"

interface ChatMessageProps {
	message: Message;
	myId: number;
	nameMap: Record<number, string>;
	avatarMap: Record<number, string>;
	isOwner?: boolean;
	isModerator?: boolean;
	deleteMessage: (message: Message) => void;
}

const ChatMessage = ({ message, myId, nameMap, avatarMap, isOwner, isModerator, deleteMessage }: ChatMessageProps) => {
	const isMine = message.sender_id === myId;

	const bubbleBg = isMine
		? "bg-[#0d1117] text-[#e5e9f0] self-start"
		: "bg-[#1e293b] text-[#e5e9f0] self-end";

	return (
		<div
			key={message.id}
			className={`
				group relative
				w-4/5 rounded-lg
				${bubbleBg}
				py-[0.45rem] pb-[0.6rem] px-[2%]
			`}
		>
			<div className="flex items-center mb-1">
				<img
					src={ //NAPRAW 
						avatarMap[message.sender_id]
							? `http://localhost:8080${avatarMap[message.sender_id]}`
							: defaultawatar
					}
					alt="avatar"
					className="h-8 w-8 rounded-full object-cover mr-2"
				/>
				<span className="text-xs font-semibold text-[#cbd5e1]">
					{nameMap[message.sender_id] ?? `user${message.sender_id}`}
				</span>
			</div>

			<div className="leading-relaxed whitespace-pre-wrap break-words">
				{message.contents}
			</div>

			{(isMine || isOwner || isModerator) && (
				<button
					className="absolute right-2 bottom-2 text-xs text-red-500 bg-gray-400 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
					onClick={() => deleteMessage(message)}
				>
					Delete message
				</button>
			)}
		</div>
	);
}

export default ChatMessage
