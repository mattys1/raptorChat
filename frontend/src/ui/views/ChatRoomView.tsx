// frontend/src/ui/views/ChatRoomView.tsx

import { useRef, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChatRoomHook } from "../hooks/views/useChatRoomHook";
import { useRoomRoles } from "../hooks/useRoomRoles";
import { useResourceFetcher } from "../hooks/useResourceFetcher";
import { MessageEvents } from "../../structs/MessageNames";
import { Message, RoomsType, User, Call } from "../../structs/models/Models";
import { EventResource } from "../../structs/Message";
import { ROUTES } from "../routes";
import sound from "../assets/sound/callsound.mp3";

// New imports for call‐popup feature:
import { useCallRequestHook } from "../hooks/views/useCallRequestHook";
import { useCallRejectRequestHook } from "../hooks/views/useCallRejectRequestHook";
import { useEventListener } from "../hooks/useEventListener";

const API_URL = "http://localhost:8080";

interface CallRequestPayload {
  caller_id: number;
}
interface RejectPayload {
  message: string;
}

const ChatRoomView: React.FC = () => {
  const chatId = Number(useParams().chatId);
  const navigate = useNavigate();

  const props = useChatRoomHook(chatId);
  const { isOwner, isModerator } = useRoomRoles(chatId);

  const [users] = useResourceFetcher<User[]>([], `/api/rooms/${chatId}/user`);
  const nameMap = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u.username])),
    [users]
  );
  const avatarMap = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u.avatar_url || ""])),
    [users]
  );

  const myId = Number(localStorage.getItem("uID") ?? 0);

  // ─── NEW: State for call‐popup feature ────────────────────────────
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState<CallRequestPayload | null>(null);
  const [callRejected, setCallRejected] = useState<string | null>(null);

  // Hooks to send call request or reject:
  const [, , sendCallRequest] = useCallRequestHook(chatId);
  const [, , sendCallRejectRequest] = useCallRejectRequestHook(chatId);

  // Subscribe to Centrifugo for call_request, call_rejected, call_created
  const [callEvent] = useEventListener<
    CallRequestPayload | RejectPayload | Call
  >(`room:${chatId}`, ["call_request", "call_rejected", "call_created"]);

  // ─── Handle incoming events ───────────────────────────────────────
  useEffect(() => {
    if (callEvent.event === "call_request" && callEvent.item) {
      const payload = callEvent.item as CallRequestPayload;
      if (payload.caller_id !== myId) {
        setIncomingCall(payload);
      }
    } else if (callEvent.event === "call_rejected" && callEvent.item) {
      const payload = callEvent.item as RejectPayload;
      setCallRejected(payload.message);
      setIsCalling(false);
    } else if (callEvent.event === "call_created" && callEvent.item) {
      const callObj = callEvent.item as Call;
      if (callObj.room_id === chatId && callObj.status === "active") {
        navigate(`${ROUTES.CHATROOM}/${chatId}/call`);
      }
    }
  }, [callEvent, myId, chatId, navigate]);

  // ─── Play ring on incomingCall, stop when closed ──────────────────
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (incomingCall) {
      if (!ringAudioRef.current) {
        ringAudioRef.current = new Audio(sound);
      }
      ringAudioRef.current.currentTime = 0;
      ringAudioRef.current.play().catch((e) => {
        console.warn("Could not play ring sound:", e);
      });
    } else {
      if (ringAudioRef.current) {
        ringAudioRef.current.pause();
        ringAudioRef.current.currentTime = 0;
      }
    }
  }, [incomingCall]);

  // ─── Handlers for Accept / Reject ─────────────────────────────────
  const handleAccept = () => {
    // Navigate first so user2 enters call immediately
    navigate(`${ROUTES.CHATROOM}/${chatId}/call`);
    // Then notify backend to join/create the call
    props.notifyOnCallJoin(null); // POST /api/rooms/{chatId}/calls/joined
    setIncomingCall(null);
  };

  const handleReject = () => {
    sendCallRejectRequest(null); // POST /api/rooms/{chatId}/calls/reject_request
    setIncomingCall(null);
  };

  // ─── Caller clicks “Call” ────────────────────────────────────────
  const onClickCall = () => {
    setIsCalling(true);
    sendCallRequest(null); // POST /api/rooms/{chatId}/calls/request
+   navigate(`${ROUTES.CHATROOM}/${chatId}/call`);
  };

  // ─── If call was rejected, clear banner after 3s ─────────────────
  useEffect(() => {
    if (callRejected) {
      const t = setTimeout(() => setCallRejected(null), 3000);
      return () => clearTimeout(t);
    }
  }, [callRejected]);

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
          className={`px-2 py-1 text-sm text-white rounded transition-colors ${
            isCalling
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
          onClick={onClickCall}
          disabled={isCalling}
        >
          {isCalling ? "Calling…" : "Call"}
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
                  className="absolute right-2 bottom-2 text-xs text-red-500 bg-gray-400 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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

      {/* ─── Incoming Call Modal ─────────────────────────────────────────── */}
      {incomingCall && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg w-80 text-center">
            <p className="mb-4">
              <strong>{nameMap[incomingCall.caller_id]}</strong> is calling…
            </p>
            <div className="flex justify-around">
              <button
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                onClick={handleAccept}
              >
                Accept
              </button>
              <button
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                onClick={handleReject}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Call Rejected Banner ────────────────────────────────────────── */}
      {callRejected && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded z-40">
          {callRejected}
        </div>
      )}
    </div>
  );
};

export default ChatRoomView;