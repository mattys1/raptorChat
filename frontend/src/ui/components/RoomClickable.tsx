import { useNavigate } from "react-router-dom"
import { useResourceFetcher } from "../hooks/useResourceFetcher"
import { ROUTES } from "../routes"
import FriendButton from "./FriendButton"
import { Room, User } from "../../structs/models/Models"

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

            return <FriendButton userId={other?.id} room={room}></FriendButton>
        })()
	)
}

export default RoomClickable;
