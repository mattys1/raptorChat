import React, { useState, useEffect, useRef } from "react";
import { useSidebarHook } from "../hooks/views/useSidebarHook";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";

import { CentrifugoService } from "../../logic/CentrifugoService";
import { EventResource } from "../../structs/Message";
import { Call } from "../../structs/models/Models";
import sound from "../assets/sound/callsound.mp3";

const API_URL = "http://localhost:8080";

interface CallRequestPayload {
  caller_id: number;
}
interface RejectPayload {
  message: string;
}

interface SidebarProps {
  onSettingsClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSettingsClick }) => {
  const navigate = useNavigate();
  const props = useSidebarHook();

  const myId = Number(localStorage.getItem("uID") ?? 0);

  const [incomingCall, setIncomingCall] = useState<{
    caller_id: number;
    roomId: number;
  } | null>(null);

  const [callRejected, setCallRejected] = useState<string | null>(null);

  const ringAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    props.rooms?.forEach((room) => {
      if (!room) return;
      const channel = `room:${room.id}`;

      CentrifugoService.subscribe(channel).then((sub) => {
        sub.on("publication", (ctx) => {
          const incoming = ctx.data as EventResource<any>;
          const eventName = incoming.event_name;
          const contents = incoming.contents as any;

          if (eventName === "call_request") {
            const payload = contents as CallRequestPayload;
            if (payload.caller_id !== myId) {
              setIncomingCall({ caller_id: payload.caller_id, roomId: room.id });
            }
          } else if (eventName === "call_rejected") {
            const payload = contents as RejectPayload;
            setCallRejected(payload.message);
          } else if (eventName === "call_created") {
            const callObj = contents as Call;
            if (callObj.room_id === room.id && callObj.status === "active") {
              navigate(`${ROUTES.CHATROOM}/${room.id}/call`);
            }
          }
        });
      });
    });

    return () => {
      props.rooms?.forEach((room) => {
        if (room) CentrifugoService.unsubscribe(`room:${room.id}`);
      });
    };
  }, [props.rooms, myId, navigate]);

  useEffect(() => {
    if (incomingCall) {
      if (ringAudioRef.current) {
        ringAudioRef.current.pause();
        ringAudioRef.current.currentTime = 0;
        ringAudioRef.current.removeAttribute("src");
        ringAudioRef.current.load();
        ringAudioRef.current = null;
      }

      const audio = new Audio(sound);

      const onEnded = () => {
        if (incomingCall && ringAudioRef.current) {
          ringAudioRef.current.currentTime = 0;
          ringAudioRef.current.play().catch((e) => {
            console.warn("Could not loop ring sound:", e);
          });
        }
      };
      audio.addEventListener("ended", onEnded);

      audio.currentTime = 0;
      audio
        .play()
        .catch((e) => console.warn("Could not play ring sound:", e));

      ringAudioRef.current = audio;
    } else {
      if (ringAudioRef.current) {
        ringAudioRef.current.pause();
        ringAudioRef.current.currentTime = 0;
        ringAudioRef.current.removeAttribute("src");
        ringAudioRef.current.load();
        ringAudioRef.current = null;
      }
    }


    return () => {
      if (ringAudioRef.current) {
        ringAudioRef.current.pause();
        ringAudioRef.current.currentTime = 0;
        ringAudioRef.current.removeAttribute("src");
        ringAudioRef.current.load();
        ringAudioRef.current = null;
      }
    };
  }, [incomingCall]);

  const handleAccept = () => {
    if (!incomingCall) return;
    const roomId = incomingCall.roomId;
    navigate(`${ROUTES.CHATROOM}/${roomId}/call`);
    setIncomingCall(null);
  };

  const handleReject = () => {
    if (!incomingCall) return;
    const roomId = incomingCall.roomId;
    fetch(`${API_URL}/api/rooms/${roomId}/calls/reject_request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch((e) => console.error(e));
    setIncomingCall(null);
  };

  useEffect(() => {
    if (callRejected) {
      const t = setTimeout(() => setCallRejected(null), 3000);
      return () => clearTimeout(t);
    }
  }, [callRejected]);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Friends</h2>
        <button
          className="mb-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate(ROUTES.INVITE_FRIENDS)}
        >
          Invite Friends
        </button>
        <ul className="space-y-1">
          {props.rooms?.map((room) =>
            room?.type === "direct" ? (
              <li
                key={room.id}
                className="cursor-pointer px-2 py-1 rounded hover:bg-gray-700"
                onClick={() => navigate(`${ROUTES.CHATROOM}/${room.id}`)}
              >
                {room.name}
              </li>
            ) : null
          )}
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Group Chat</h2>
        <ul className="space-y-1">
          {props.rooms?.map((room) =>
            room?.type === "group" ? (
              <li
                key={room.id}
                className="cursor-pointer px-2 py-1 rounded hover:bg-gray-700"
                onClick={() => navigate(`${ROUTES.CHATROOM}/${room.id}`)}
              >
                {room.name}
              </li>
            ) : null
          )}
        </ul>
      </div>

      <div className="mt-auto space-y-2">
        <button
          className="w-full text-left px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
          onClick={() => navigate(ROUTES.MAIN)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9.75L12 3l9 6.75V20a.75.75 0 01-.75.75H3.75A.75.75 0 013 20V9.75z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 22V12h6v10"
            />
          </svg>
          Return to Start Screen
        </button>
        <button
          className="w-full text-left px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
          onClick={() => navigate(`${ROUTES.MAIN}/invites`)}
        >
          <span className="mr-2 text-xl font-bold"></span>
          See Invites
        </button>
        <button
          className="w-full text-left px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
          onClick={onSettingsClick}
        >
          Settings
        </button>
        <button
          className="w-full text-left px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => navigate(`${ROUTES.CHATROOM}/create`)}
        >
          Create room
        </button>
      </div>

      {incomingCall && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg w-72">
            <p className="mb-3 text-center">
              <strong>User {incomingCall.caller_id}</strong> is calling…
            </p>
            <div className="flex justify-between">
              <button
                className="px-3 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors"
                onClick={handleAccept}
              >
                Accept
              </button>
              <button
                className="px-3 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
                onClick={handleReject}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {callRejected && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded z-40">
          {callRejected}
        </div>
      )}
    </div>
  );
};

export default Sidebar;