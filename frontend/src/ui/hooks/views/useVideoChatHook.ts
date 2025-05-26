import { useEffect, useRef, useState } from "react"
import { SERVER_URL } from "../../../api/routes"
import { Room } from "livekit-client"

export const useVideoChatHook = (chatId: Number) => {
	// const [presence] = usePresence(`room:${chatId}:video`)
	const audio = useRef<HTMLAudioElement | null>(null)
	const mic = localStorage.getItem("selectedMicrophone") ?? ""
	const cam = localStorage.getItem("selectedCamera") ?? ""
	// const connectionState = useConnectionState();
	const [livekitToken, setLivekitToken] = useState<string | null>(null)
	const [room] = useState(() => new Room({
		// adaptiveStream: true,
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
			setLivekitToken(null); // Reset on unmount
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
		audio,
		room,
	}
}
