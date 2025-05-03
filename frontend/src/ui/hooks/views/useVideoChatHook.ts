import { useCallback, useEffect, useRef } from "react"
import { useFetchAndListen } from "../useFetchAndListen"
import { usePresence } from "../usePresence"
import { useSelectedMicrophone } from "../useSelectedMicrophone"

export const useVideoChatHook = (chatId: Number) => {
	const [presence] = usePresence(`room:${chatId}:video`)
	const audio = useRef<HTMLAudioElement | null>(null)
	const stream = useSelectedMicrophone(localStorage.getItem("selectedMicrophone") ?? "").stream


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
	}, [])

	return {
		stream,
		audio,
		listen,
	}
}
