import { useNavigate, useParams } from "react-router-dom";
import { useChatRoomHook } from "../hooks/views/useChatRoomHook";
import "./Start.css";
import { MessageEvents } from "../../structs/MessageNames";
import { Message, RoomsType } from "../../structs/models/Models";
import { EventResource } from "../../structs/Message";
import { ROUTES } from "../routes";
import { useRoomRoles } from "../hooks/useRoomRoles";

const ChatRoomView: React.FC = () => {
  const chatId   = Number(useParams().chatId);
  const navigate = useNavigate();
  const { room, messageList, sendChatMessage } = useChatRoomHook(chatId);

  const { isOwner, isModerator } = useRoomRoles(chatId);

  return (
    <>
      {room?.type === RoomsType.Group && (
        <button onClick={() => navigate(`${ROUTES.CHATROOM}/${chatId}/invite`)}>
          Invite user to chatroom
        </button>
      )}

      {(isOwner || isModerator) && (
        <button onClick={() => navigate(`${ROUTES.CHATROOM}/${chatId}/manage`)}>
          Manage room
        </button>
      )}

      <h3>
        {room?.type === RoomsType.Group ? "Group Chat" : ""} {room?.name}
      </h3>

      <ul>
        {messageList.map((m, i) => (
          <li key={i}>
            {m.contents}{" "}
            <span style={{ opacity: 0.6 }}>from {m.sender_id}</span>
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd  = new FormData(e.currentTarget);
          const txt = fd.get("messageBox")?.toString() ?? "";

          sendChatMessage({
            channel:   `room:${chatId}`,
            method:    "POST",
            event_name: MessageEvents.MESSAGE_SENT,
            contents: {
              id: 0,
              room_id: chatId,
              sender_id: 0,
              contents: txt,
            } as Message,
          } as EventResource<Message>);

          e.currentTarget.reset();
        }}
      >
        <input name="messageBox" />
        <button type="submit">send</button>
      </form>
    </>
  );
};

export default ChatRoomView;