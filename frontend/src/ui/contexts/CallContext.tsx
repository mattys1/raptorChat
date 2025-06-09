import React, {
  createContext, useContext, useState, useCallback, useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from "../../api/routes";
import { CentrifugoService } from "../../logic/CentrifugoService";

interface Incoming { room_id: number; caller_id: number; caller_username: string }
interface Outgoing { room_id: number; callee_id: number }

interface Ctx {
  incomingCall: Incoming | null;
  outgoingCall: Outgoing | null;
  requestDirectCall: (room: number, callee: number) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
}

const CallContext = createContext<Ctx | undefined>(undefined);
export const useCallContext = () => useContext(CallContext)!;

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const uid = Number(localStorage.getItem("uID") || 0);
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();

  const [incomingCall, setIncoming] = useState<Incoming | null>(null);
  const [outgoingCall, setOutgoing]   = useState<Outgoing | null>(null);

  // ----------------------------------------------------- Centrifugo listener
  useEffect(() => {
    (async () => {
      const sub = await CentrifugoService.subscribe(`user:${uid}:calls`);
      sub.on("publication", ({ data }) => {
        const { event_name, contents } = data as any;
        switch (event_name) {
          case "incoming_call":  setIncoming(contents);                 break;
          case "call_accepted":
            if (outgoingCall && contents.room_id === outgoingCall.room_id) {
              navigate(`/app/chatroom/${contents.room_id}/call`);
              setOutgoing(null);
            }
            break;
          case "call_rejected":
            if (outgoingCall && contents.room_id === outgoingCall.room_id) {
              alert("Call rejected");
              setOutgoing(null);
            }
            break;
        }
      });
    })();
  }, [uid, outgoingCall, navigate]);

  // --------------------------------------------------------------- actions
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const requestDirectCall = useCallback(async (room: number, callee: number) => {
    await fetch(`${SERVER_URL}/api/rooms/${room}/calls/request`, { method: "POST", headers });
    setOutgoing({ room_id: room, callee_id: callee });
  }, [headers]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    await fetch(`${SERVER_URL}/api/rooms/${incomingCall.room_id}/calls/joined`, { method: "POST", headers });
    navigate(`/app/chatroom/${incomingCall!.room_id}/call`);
    setIncoming(null);
  }, [incomingCall, headers, navigate]);

  const rejectCall = useCallback(async () => {
    if (!incomingCall) return;
    await fetch(`${SERVER_URL}/api/rooms/${incomingCall.room_id}/calls/reject`, { method: "POST", headers });
    setIncoming(null);
  }, [incomingCall, headers]);

  return (
    <CallContext.Provider value={{ incomingCall, outgoingCall, requestDirectCall, acceptCall, rejectCall }}>
      {children}
    </CallContext.Provider>
  );
};