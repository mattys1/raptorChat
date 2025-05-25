import { useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChatRoomHook } from "../hooks/views/useChatRoomHook";
import { useRoomRoles } from "../hooks/useRoomRoles";
import { useResourceFetcher } from "../hooks/useResourceFetcher";
import { MessageEvents } from "../../structs/MessageNames";
import { Message, RoomsType, User } from "../../structs/models/Models";
import { EventResource } from "../../structs/Message";
import { ROUTES } from "../routes";

const API_URL = "http://localhost:8080";

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
        {(isOwner || isModerator) && (
          <button
            className="px-2 py-1 text-sm text-white bg-purple-600 rounded hover:bg-purple-700 transition-colors"
            onClick={() => navigate(`${ROUTES.CHATROOM}/${chatId}/manage`)}
          >
            Manage room
          </button>
        )}
        <button
          className="px-2 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
          onClick={() => navigate(`${ROUTES.CHATROOM}/${chatId}/call`)}
        >
          Call
        </button>
      </div>

      <div className="flex items-center justify-between px-4 py-2">
        <div className="w-24" />
        <div className="text-center flex-1">
          {props.room?.type === RoomsType.Group && (
            <strong className="font-bold">Group Chat:</strong>
          )}{" "}
          {props.room?.name}
        </div>
        <div className="w-24 text-right">
          {props.room?.type === RoomsType.Group
            ? `${props.memberCount} members`
            : ""}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto space-y-3 px-[2%] py-4">
        {props.messageList.map((m) => {
          const isMine = m.sender_id === myId;

          const bubbleBg = isMine
            ? "bg-[#0d1117] text-[#e5e9f0] self-start"
            : "bg-[#1e293b] text-[#e5e9f0] self-end";

          return (
            <div
              key={m.id}
              className={`
                group relative
                w-4/5 rounded-lg
                ${bubbleBg}
                py-[0.45rem] pb-[0.6rem] px-[2%]
              `}
            >
              <div className="flex items-center mb-1">
                <img
                  src={
                    avatarMap[m.sender_id]
                      ? `${API_URL}${avatarMap[m.sender_id]}`
                      : "/default-avatar.png"
                  }
                  alt="avatar"
                  className="h-8 w-8 rounded-full object-cover mr-2"
                />
                <span className="text-xs font-semibold text-[#cbd5e1]">
                  {nameMap[m.sender_id] ?? `user${m.sender_id}`}
                </span>
              </div>

              <div className="leading-relaxed whitespace-pre-wrap break-words">
                {m.contents}
              </div>

              {(isMine || isOwner || isModerator) && (
                <button
                  className="absolute right-2 bottom-2 text-xs text-red-500 bg-gray-400 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteMessage(m)}
                >
                  Delete message
                </button>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
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