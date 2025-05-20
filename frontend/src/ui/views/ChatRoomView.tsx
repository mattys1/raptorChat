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


const API_URL = "http://localhost:8080";

const ChatRoomView: React.FC = () => {
  const chatId   = Number(useParams().chatId);
  const navigate = useNavigate();

  const props = useChatRoomHook(chatId);
  const { isOwner, isModerator } = useRoomRoles(chatId);

  const [users] = useResourceFetcher<User[]>([], `/api/rooms/${chatId}/user`);
  const nameMap = useMemo(
    () => Object.fromEntries(users.map(u => [u.id, u.username])),
    [users]
  );
  const avatarMap = useMemo(
    () => Object.fromEntries(users.map(u => [u.id, u.avatar_url || ""])),
    [users]
  );

  const myId = Number(localStorage.getItem("uID") ?? 0);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [props.messageList]);

  const send = (text: string) => {
    props.sendChatMessageAction({
      channel:    `room:${chatId}`,
      method:     "POST",
      event_name: MessageEvents.MESSAGE_SENT,
      contents:   { id:0, room_id:chatId, sender_id:0, contents:text } as Message,
    } as EventResource<Message>);
  };

  const deleteMessage = (m: Message) => {
    props.sendChatMessageAction({
      channel:    `room:${chatId}`,
      method:     "DELETE",
      event_name: MessageEvents.MESSAGE_DELETED,
      contents:   m,
    } as EventResource<Message>);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.topButtons}>
        {props.room?.type === RoomsType.Group && (
          <button onClick={() => navigate(`${ROUTES.CHATROOM}/${chatId}/invite`)}>
            Invite user to chatroom
          </button>
        )}
        {(isOwner || isModerator) && (
          <button onClick={() => navigate(`${ROUTES.CHATROOM}/${chatId}/manage`)}>
            Manage room
          </button>
        )}
        <button
          onClick={() => {
            console.log("navigating to call", chatId);
            navigate(`${ROUTES.CHATROOM}/${chatId}/call`);
          }}
        >
          Call
        </button>
      </div>

      <div className="flex items-center justify-between px-4 py-2">
        <div className="w-24" />
        <div className="text-center flex-1">
          {props.room?.type === RoomsType.Group ? (
            <strong className="font-bold">Group Chat:</strong>
          ) : (
            ""
          )}{" "}
          {props.room?.name}
        </div>
        <div className="w-24 text-right">
          {props.room?.type === RoomsType.Group
            ? `${props.memberCount} members`
            : ""}
        </div>
      </div>

      <div className={styles.messages}>
        {props.messageList.map(m => (
          <div
            key={m.id}
            className={`${styles.bubble} ${
              m.sender_id === myId ? styles.mine : ""
            } group relative`}
          >
            <div className={styles.header}>
              <img
                src={
                  avatarMap[m.sender_id]
                    ? `${API_URL}${avatarMap[m.sender_id]}`
                    : "/default-avatar.png"
                }
                alt="avatar"
                className={styles.avatar}
              />
              <span>
                {nameMap[m.sender_id] ?? `user${m.sender_id}`}
              </span>
            </div>
            {m.contents}
            {(m.sender_id === myId || isOwner || isModerator) && (
              <button
                className={styles.messageDeleteButton}
                onClick={() => deleteMessage(m)}
              >
                Delete message
              </button>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        className={styles.footer}
        onSubmit={e => {
          e.preventDefault();
          const text = (
            e.currentTarget.elements.namedItem(
              "messageBox"
            ) as HTMLInputElement
          ).value;
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
        <button type="submit" className={styles.sendBtn}>
          send
        </button>
      </form>
    </div>
  );
};

export default ChatRoomView;