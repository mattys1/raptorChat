import React, { useEffect, useRef } from "react";
import { useCallContext } from "../contexts/CallContext";
import ringtone from "../assets/callsound/callsound.mp3";

const IncomingCallPopup: React.FC = () => {
	const ctx = useCallContext();
	if (!ctx) return null;            

	const { incomingCalls, acceptCall, rejectCall } = ctx;
	const audio = useRef<HTMLAudioElement>(null);

	useEffect(() => {
		if (incomingCalls.length) {
			audio.current?.play().catch(() => {});
		} else {
			audio.current?.pause();
			if (audio.current) audio.current.currentTime = 0;
		}
	}, [incomingCalls.length]);

	if (!incomingCalls.length) return null;

	return (
		<>
			<audio ref={audio} src={ringtone} loop />

			<div className="fixed top-4 right-4 z-50 flex flex-col space-y-4 w-80">
				{incomingCalls.map((call) => (
					<div
						key={call.room_id}
						className="bg-gray-800 text-white rounded-xl shadow-xl p-4"
					>
						<h2 className="text-lg font-semibold mb-2 text-center">
							Incoming call from&nbsp;
							<span className="font-mono">{call.caller_username}</span>
						</h2>

						<div className="flex justify-center space-x-2">
							<button
								onClick={() => acceptCall(call)}
								className="px-3 py-1 rounded-lg text-white bg-green-600 hover:bg-green-700"
							>
								Accept
							</button>
							<button
								onClick={() => rejectCall(call)}
								className="px-3 py-1 rounded-lg text-white bg-red-600 hover:bg-red-700"
							>
								Reject
							</button>
						</div>
					</div>
				))}
			</div>
		</>
	);
};

export default IncomingCallPopup;
