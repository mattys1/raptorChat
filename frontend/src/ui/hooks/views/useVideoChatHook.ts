import { useCallback, useEffect, useRef, useState } from "react"
import { useFetchAndListen } from "../useFetchAndListen"
import { usePresence } from "../usePresence"
import { useSelectedMicrophone } from "../useSelectedMicrophone"
import { useConnectionState } from "@livekit/components-react"
import { SERVER_URL } from "../../../api/routes"

export const useVideoChatHook = (chatId: Number) => {
	// const [presence] = usePresence(`room:${chatId}:video`)
	const audio = useRef<HTMLAudioElement | null>(null)
	const stream = useSelectedMicrophone(localStorage.getItem("selectedMicrophone") ?? "").stream
	// const connectionState = useConnectionState();
	const [livekitToken, setLivekitToken] = useState<string | null>(null)

	useEffect(() => {
		let isValid = true;

		const fetchToken = async () => {
			console.log("Fetching token room", chatId)
			try {
				const res = await fetch(`${SERVER_URL}/livekit/${chatId}/token?userId=${localStorage.getItem("uID")}`, {
					method: "GET",
					headers: { 
						"Content-Type": "application/json",
						"Authorization": `Bearer ${localStorage.getItem("token")}`
					},
				});
				console.log(res)
				const data = await res.json();
				if (isValid) setLivekitToken(data.token);
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
		if(!audio.current || !stream) return
		
		audio.current.srcObject = stream
		
		audio.current.play().catch(err => {
			console.log("Cant autoplay", err)
		})
	}, [stream, audio])

	const listen = useCallback(() => {
		if(!audio.current) return
		if(!stream) return

		audio.current.srcObject = stream
		audio.current.play()
	}, [chatId])

	return {
		stream,
		audio,
		listen,
		livekitToken,
	}
}
