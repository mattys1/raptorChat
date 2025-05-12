import { useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChatRoomHook } from "../hooks/views/useChatRoomHook";
import { useRoomRoles } from "../hooks/useRoomRoles";
import { useResourceFetcher } from "../hooks/useResourceFetcher";
import { MessageEvents } from "../../structs/MessageNames";
import { Message, RoomsType, User } from "../../structs/models/Models";
import { EventResource } from "../../structs/Message";
import { ROUTES } from "../routes";
import styles from "./ChatRoomView.module.css";

const ChatRoomView: React.FC = () => {
  const chatId   = Number(useParams().chatId);
  const navigate = useNavigate();

  /* existing room + messages logic */
  const { room, messageList, sendChatMessage } = useChatRoomHook(chatId);

  const { isOwner, isModerator } = useRoomRoles(chatId);

  const [users] = useResourceFetcher<User[]>([], `/api/rooms/${chatId}/user`);
  const nameMap = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u.username])),
    [users]
  );

  const myId = Number(localStorage.getItem("uID") ?? 0);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  const send = (text: string) => {
    sendChatMessage({
      channel:   `room:${chatId}`,
      method:    "POST",
      event_name: MessageEvents.MESSAGE_SENT,
      contents: {
        id: 0,
        room_id: chatId,
        sender_id: 0,
        contents: text,
      } as Message,
    } as EventResource<Message>);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.topButtons}>
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
          <button onClick={() => { console.log("navigating to call", chatId); navigate(`${ROUTES.CHATROOM}/${chatId}/call`) }}>
                Call
          </button>
      </div>

      <h3 style={{ textAlign: "center", margin: 0, paddingBottom: "0.5rem" }}>
        {room?.type === RoomsType.Group ? "Group Chat" : ""} {room?.name}
      </h3>

      <div className={styles.messages}>
        {messageList.map((m) => (
          <div
            key={m.id}
            className={`${styles.bubble} ${m.sender_id === myId ? styles.mine : ""}`}
          >
            <div className={styles.header}>
              {nameMap[m.sender_id] ?? `user${m.sender_id}`}
            </div>
            {m.contents}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        className={styles.footer}
        onSubmit={(e) => {
          e.preventDefault();
          const text = (e.currentTarget.elements.namedItem("messageBox") as HTMLInputElement)
            .value;
          if (text.trim()) send(text.trim());
          e.currentTarget.reset();
        }}
      >
        <input
          name="messageBox"
          className={styles.input}
          placeholder="Type a message..."
          autoComplete="off"
        />
        <button type="submit" className={styles.sendBtn}>send</button>
      </form>
    </div>
  );
};

export default ChatRoomView;