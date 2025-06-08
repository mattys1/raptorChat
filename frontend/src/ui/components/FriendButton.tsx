import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";
import { Room, User } from "../../structs/models/Models";
import defaultavatar from "../assets/defaultavatar/defaultavatar.jpg";

const API_URL = "http://localhost:8080";

const FriendButton = ({ user, room }: { user: User; room: Room }) => {
  const navigate = useNavigate();
  const avatarSrc = user?.avatar_url ? `${API_URL}${user.avatar_url}` : defaultavatar;

  return (
    <div
      onClick={() => navigate(`${ROUTES.CHATROOM}/${room.id}`)}
      className="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded-md"
    >
      <img
        className="h-8 w-8 rounded-full object-cover mr-2"
        src={avatarSrc}
        alt={user?.username || "User avatar"}
      />
      <span className="truncate">{user?.username}</span>
    </div>
  );
};

export default FriendButton;