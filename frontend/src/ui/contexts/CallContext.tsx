import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from "../../api/routes";
import { CentrifugoService } from "../../logic/CentrifugoService";

/* -------------------------------------------------- types */
interface Incoming {
  room_id: number;
  caller_id: number;
  caller_username: string;
}
interface Outgoing {
  room_id: number;
  callee_id: number;
}

interface Ctx {
  incomingCall: Incoming | null;
  incomingCalls: Incoming[];
  outgoingCall: Outgoing | null;

  requestDirectCall: (room: number, callee: number) => Promise<void>;
  acceptCall: (call?: Incoming) => Promise<void>;
  rejectCall: (call?: Incoming) => Promise<void>;
}

const CallContext = createContext<Ctx | undefined>(undefined);
export const useCallContext = () => useContext(CallContext)!;

/* ================================================= provider */
export const CallProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const uid = Number(localStorage.getItem("uID") || 0);
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();

  /* --------------------------- state */
  const [incomingCalls, setIncomingCalls] = useState<Incoming[]>([]);
  const [outgoingCall, setOutgoing] = useState<Outgoing | null>(null);
  const incomingCall = incomingCalls[0] ?? null; // legacy single call

  /* ---------------------- centrifugo listener (only once) */
  useEffect(() => {
    let sub: any;

    const handler = ({ data }: any) => {
      const { event_name, contents } = data as any;
      switch (event_name) {
        case "incoming_call":
          // ✨ add only if not already queued
          setIncomingCalls((prev) =>
            prev.some((c) => c.room_id === contents.room_id)
              ? prev
              : [...prev, contents]
          );
          break;

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
    };

    (async () => {
      sub = await CentrifugoService.subscribe(`user:${uid}:calls`);
      sub.on("publication", handler);
    })();

    /* 🔥 clean up on unmount */
    return () => {
      if (sub) {
		CentrifugoService.unsubscribe(`user:${uid}:calls`)
      }
    };
  }, [uid, navigate, outgoingCall]);

  /* -------------------------- actions */
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const requestDirectCall = useCallback(
    async (room: number, callee: number) => {
      await fetch(`${SERVER_URL}/api/rooms/${room}/calls/request`, {
        method: "POST",
        headers,
      });
      setOutgoing({ room_id: room, callee_id: callee });
    },
    [headers]
  );

  const acceptCall = useCallback(
    async (call?: Incoming) => {
      const target = call ?? incomingCalls[0];
      if (!target) return;

      await fetch(
        `${SERVER_URL}/api/rooms/${target.room_id}/calls/joined`,
        { method: "POST", headers }
      );
      navigate(`/app/chatroom/${target.room_id}/call`);
      setIncomingCalls((prev) =>
        prev.filter((c) => c.room_id !== target.room_id)
      );
    },
    [incomingCalls, headers, navigate]
  );

  const rejectCall = useCallback(
    async (call?: Incoming) => {
      const target = call ?? incomingCalls[0];
      if (!target) return;

      await fetch(
        `${SERVER_URL}/api/rooms/${target.room_id}/calls/reject`,
        { method: "POST", headers }
      );
      setIncomingCalls((prev) =>
        prev.filter((c) => c.room_id !== target.room_id)
      );
    },
    [incomingCalls, headers]
  );

  /* ------------------------ provider value */
  return (
    <CallContext.Provider
      value={{
        incomingCall,
        incomingCalls,
        outgoingCall,
        requestDirectCall,
        acceptCall,
        rejectCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
