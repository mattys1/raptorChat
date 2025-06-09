import React, { useEffect, useRef } from "react";
import { useCallContext } from "../contexts/CallContext";
import ringtone from "../assets/callsound/callsound.mp3";

const IncomingCallPopup: React.FC = () => {
  const { incomingCall, acceptCall, rejectCall } = useCallContext();
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (incomingCall) audio.current?.play().catch(() => {});
    else { audio.current?.pause(); if (audio.current) audio.current.currentTime = 0; }
  }, [incomingCall]);

  if (!incomingCall) return null;

  return (
    <>
      <audio ref={audio} src={ringtone} loop />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white w-96 rounded-xl shadow-xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">
            Incoming call from <span className="font-mono">{incomingCall.caller_username}</span>
          </h2>
          <div className="flex justify-center space-x-4">
            <button onClick={acceptCall} className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700">
              Accept
            </button>
            <button onClick={rejectCall} className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700">
              Reject
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default IncomingCallPopup;
