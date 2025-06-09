import { useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChatRoomHook } from "../hooks/views/useChatRoomHook";
import { useRoomRoles } from "../hooks/useRoomRoles";
import { useResourceFetcher } from "../hooks/useResourceFetcher";
import { MessageEvents } from "../../structs/MessageNames";
import { Message, Room, RoomsType, User } from "../../structs/models/Models";
import { EventResource } from "../../structs/Message";
import { ROUTES } from "../routes";
import MessageTimeline from "../components/MessageTimeline";
import { useCallContext } from "../contexts/CallContext";

const ChatRoomView: React.FC = () => {
	const chatId = Number(useParams().chatId);
	const navigate = useNavigate();

	const props = useChatRoomHook(chatId);
	const { isOwner, isModerator } = useRoomRoles(chatId);

	const [users] = useResourceFetcher<User[]>(
		[],
		`/api/rooms/${chatId}/user`
	);
	const nameMap = useMemo(
		() =>
			Object.fromEntries(users.map((u) => [u.id, u.username])),
		[users]
	);
	const avatarMap = useMemo(
		() =>
			Object.fromEntries(
				users.map((u) => [u.id, u.avatar_url || ""])
			),
		[users]
	);

	const myId = Number(localStorage.getItem("uID") ?? 0);

	const bottomRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [props.messageList]);

	const send = (text: string) => {
		props.sendChatMessageAction({
			channel: `room:${chatId}`,
			method: "POST",
			event_name: MessageEvents.MESSAGE_SENT,
			contents: {
				id: 0,
				room_id: chatId,
				sender_id: 0,
				contents: text,
			} as Message,
		} as EventResource<Message>);
	};

	const deleteMessage = (m: Message) => {
		props.sendChatMessageAction({
			channel: `room:${chatId}`,
			method: "DELETE",
			event_name: MessageEvents.MESSAGE_DELETED,
			contents: m,
		} as EventResource<Message>);
	};

	const { requestDirectCall } = useCallContext();

	return (
		<div className="flex flex-col h-full w-full min-w-0">
			<div className="px-4 py-2 flex space-x-2">
				{props.room?.type === RoomsType.Group && (
					<button
						className="px-2 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
						onClick={() => navigate(`${ROUTES.CHATROOM}/${chatId}/invite`)}
					>
						Invite user to chatroom
					</button>
				)}

				{props.room?.type === RoomsType.Direct && (
					<button
						className="px-2 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
						onClick={() => props.createRoomEvent({
							channel: `room:${chatId}`,
							method: "DELETE",
							event_name: "room_deleted",
							contents: props?.room
						} as EventResource<Room>)}
					>
						Unfriend user
					</button>
					
				)}
				{(isOwner || isModerator) && (
					<button
						className="px-2 py-1 text-sm text-white bg-purple-600 rounded hover:bg-purple-700 transition-colors"
						onClick={() => navigate(`${ROUTES.CHATROOM}/${chatId}/manage`)}
					>
						Manage room
					</button>
				)}
				<button
					className="px-2 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
					onClick={async () => {
						if (props.room?.type === RoomsType.Direct) {
						const peer = users.find(u => u.id !== myId);
						if (peer) {
							await requestDirectCall(chatId, peer.id); // ring peer
							await props.notifyOnCallJoin(null);       // join yourself
							navigate(`${ROUTES.CHATROOM}/${chatId}/call`);
						}
						} else {
						// unchanged behaviour for group calls
						navigate(`${ROUTES.CHATROOM}/${chatId}/call`);
						props.notifyOnCallJoin(null);
						}
					}}
					>
					Call
				</button>
			</div>

			<div className="flex items-center justify-between px-4 py-2">
				<div className="w-24" />
				<span className="text-center flex-1">
					{props.room?.type === RoomsType.Group && (
						<div>
							<strong className="font-bold">Group Chat:</strong>
							<span>{props.room?.name}</span>
						</div>
					)}
				</span>
				<div className="w-24 text-right">
					{props.room?.type === RoomsType.Group
						? `${props.memberCount} members`
						: ""}
				</div>
			</div>

			<div className="flex-1 flex flex-col overflow-y-auto space-y-3 px-[2%] py-4">
				<MessageTimeline 
					messages={props.messageList || []} 
					calls={props.calls || []}
					myId={myId}
					nameMap={nameMap}
					avatarMap={avatarMap}
					isOwner={isOwner}
					isModerator={isModerator}
					deleteMessage={deleteMessage}
				/>
			</div>


			<form
				className="flex items-center space-x-2 bg-[#374151] py-[0.65rem] px-4"
				onSubmit={(e) => {
					e.preventDefault();
					const input = e.currentTarget.elements.namedItem(
						"messageBox"
					) as HTMLInputElement;
					const text = input.value.trim();
					if (text) send(text);
					e.currentTarget.reset();
				}}
			>
				<input
					name="messageBox"
					placeholder="Type a message..."
					autoComplete="off"
					className="flex-1 bg-[#1f2937] text-[#e5e9f0] border border-[#4b5563] rounded-md py-[0.45rem] px-[1.5%] focus:outline-none focus:ring"
				/>
				<button
					type="submit"
					className="bg-[#1f2937] border border-[#4b5563] text-[#e5e9f0] rounded-md py-[0.45rem] px-[1.8%] hover:bg-[#334155] transition-colors"
				>
					send
				</button>
			</form>
		</div>
	);
};

export default ChatRoomView;
