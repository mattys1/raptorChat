import { useEffect, useState } from "react"
import { SERVER_URL } from "../../../api/routes"
import { Room } from "livekit-client"
import { useSendResource } from "../useSendResource"

export const useVideoChatHook = (chatId: Number) => {
	const mic = localStorage.getItem("selectedMicrophone") ?? ""
	const cam = localStorage.getItem("selectedCamera") ?? ""
	const [livekitToken, setLivekitToken] = useState<string | null>(null)
	const [room] = useState(() => new Room({
		dynacast: true,
		videoCaptureDefaults: {
			resolution: {
				width: 1920,
				height: 1080,
				frameRate: 30
			},
		},
		publishDefaults: {
			videoEncoding: {
				maxBitrate: 2_700_000,
				maxFramerate: 30,
			},
		},
	}));

	const [, , leaveRoom] = useSendResource<null>(`/api/rooms/${chatId}/calls/leave`, "POST");

	useEffect(() => {
		let isValid = true;

		const fetchToken = async () => {
			console.log("Fetching token room", chatId)
			try {
				const res = await fetch(`${SERVER_URL}/livekit/${chatId}/token?uid=${localStorage.getItem("uID")}`, {
					method: "GET",
					headers: { 
						"Content-Type": "application/json",
						"Authorization": `Bearer ${localStorage.getItem("token")}`
					},
				});
				console.log(res)
				const data = await res.json();
				if (isValid) setLivekitToken(data);
				console.log("Token fetched", data.token)
			} catch (error) {
				console.error('Token fetch failed', error);
			}
		};

		fetchToken();

		return () => {
			isValid = false;
			setLivekitToken(null);
		};
	}, [chatId]);

	useEffect(() => {
		if (!livekitToken) return;
		console.log("Connecting to LiveKit room", livekitToken)
		let mounted = true;

		const connect = async () => {
			if(mounted) {
				await room.connect("ws://localhost:7880", livekitToken!).catch((err) => { console.error("Error connecting to LiveKit room", err) })
				console.log("Active device now:", room.getActiveDevice('audioinput'));
			}
		};
		connect();

		return () => {
			mounted = false;
			room.disconnect();

			leaveRoom(null)
		};
	}, [room, livekitToken]);

	useEffect(() => {
		if(mic) {
			(async () => {
				await room.switchActiveDevice('audioinput', mic)
				console.log("Active device now:", room.getActiveDevice('audioinput'));
			})()
		}

		if(cam) {
			(async () => {
				await room.switchActiveDevice('audioinput', cam)
				console.log("Active device now:", room.getActiveDevice('audioinput'));
			})()
		}
	}, [room, mic])
	
	useEffect(() => {
		if(import.meta.env.DEV) {
			console.log("Debugging enabled")
			window.localStorage.setItem('lk-debug', 'true')
		}
	}, [])

	return {
		room,
	}
}
