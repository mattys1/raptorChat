import { useNavigate } from "react-router-dom";
import { useUserInfo } from "../hooks/useUserInfo";
import { ROUTES } from "../routes";
import { Room, User } from "../../structs/models/Models";

const FriendButton = ({user, room}: {user: User, room: Room}) => {
	const navigate = useNavigate()

	return <div onClick={() => navigate(`${ROUTES.CHATROOM}/${room.id}`)}
	className="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded-md">
		<img 
			className="h-8 w-8 rounded-full object-cover mr-2" 
			src={`http://localhost:8080${user?.avatar_url}`}
			alt={user?.username || "User avatar"}
		/>
		<span className="truncate">{user?.username}</span>
	</div>
}

export default FriendButton;
