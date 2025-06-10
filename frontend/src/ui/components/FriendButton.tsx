import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";
import { Room } from "../../structs/models/Models";
import defaultavatar from "../assets/defaultavatar/defaultavatar.jpg";
import { useUserInfo } from "../hooks/useUserInfo";

const API_URL = "http://localhost:8080";

const FriendButton = ({ userId, room }: { userId: number; room: Room }) => {
	const navigate = useNavigate();
	const [userInfo] = useUserInfo(userId)
	const avatarSrc = userInfo?.avatar_url ? `${API_URL}${userInfo?.avatar_url}` : defaultavatar;

	return (
		<div
			onClick={() => navigate(`${ROUTES.CHATROOM}/${room.id}`)}
			className="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded-md"
		>
			<img
				className="h-8 w-8 rounded-full object-cover mr-2"
				src={avatarSrc}
				alt={userInfo?.username || "User avatar"}
			/>
			<span className="truncate">{userInfo.username || "<DELETED_USER>"}</span>
		</div>
	);
};

export default FriendButton;

