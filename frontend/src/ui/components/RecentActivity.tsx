import { useEffect, useState } from "react";
import { Call, Message, Room, User } from "../../structs/models/Models";
import { useResourceFetcher } from "../hooks/useResourceFetcher"
import FriendBuutton from "./FriendButton";
import FriendButton from "./FriendButton";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";

interface Activity {
	messages: Message[]
	calls: Call[]
}

type ActivityItem = {
	type: "message" | "call"
	created_at: Date
	contents: Call | Message
}

const RoomClickable = ({roomID, ownId}: {roomID: number, ownId: number}) => {
	const [room] = useResourceFetcher<Room | null>(null, `/api/rooms/${roomID}`)
	const [roomMembers] = useResourceFetcher<User[]>([], `/api/rooms/${roomID}/user`)

	const navigate = useNavigate()

	if (!room) return <span className="text-gray-400">Loading...</span>

	return room.type == "group" ? (
		<div 
			className="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded-md"
			onClick={() => {navigate(`${ROUTES.CHATROOM}/${room.id}`)}}
		>
			<span className="truncate text-blue-400">{room.name}</span>
		</div>
	) : (
        (() => {
            const other = roomMembers.find(m => m.id !== ownId)!;

            return <FriendButton user={other} room={room}></FriendButton>
        })()
	)
}

const RecentActivity = () => {
	const [activity] = useResourceFetcher<Activity>({messages: [], calls: []} , "/api/user/me/activity");
	const [items, setItems] = useState<ActivityItem[]>([])

	const ownId = parseInt(localStorage.getItem("uID") || '0') 

	useEffect(() => {
		setItems([])
		setItems((prev) => [
			...prev,
			...activity.messages.map(m => {
				return {
					type: "message",
					created_at: new Date(m.created_at),
					contents: m
				} as ActivityItem
			}),
		])

		setItems((prev) => [
			...prev,
			...activity.calls.map(c => {
				return {
					type: "call",
					created_at: new Date(c.created_at),
					contents: c
				} as ActivityItem
			}),
		])

		setItems((prev) => prev.sort((a, b) => b.created_at.getTime() - a.created_at.getTime()))

		console.log("RecentActivity activity:", activity)
	}, [activity])

	return (
		<div>
			Recent Activity:
			<div className="flex flex-col gap-2">
				{items.map((item, index) => (
					<div key={index} className="py-2 my-2 text-white border-t border-b border-gray-600 rounded px-3 bg-gray-800 bg-opacity-30 max-w-md w-full mx-auto">
						{item.type === "message" ? (
							<div className="text-left">
								<RoomClickable roomID={item.contents.room_id} ownId={ownId} /> <br></br>

								Message at <span className="text-gray-300">{item.created_at.toLocaleString()}</span>, <span className="text-gray-400">{(item.contents as Message).contents}</span>
							</div>
						) : (
								<div className="text-left">
									<RoomClickable roomID={item.contents.room_id} ownId={ownId} /> <br></br>
									Call at <span className="text-gray-300">{item.created_at.toLocaleString()}</span>
								</div>
							)}
					</div>
				))}
			</div>
		</div>
	)
}

export default RecentActivity
