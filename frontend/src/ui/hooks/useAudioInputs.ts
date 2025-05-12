import { useEffect, useState } from "react"

export const useAudioInputs = (): [ 
	microphones: MediaDeviceInfo[],
	setMicrophones: React.Dispatch<React.SetStateAction<MediaDeviceInfo[]>> 
] => {
	const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([])

	useEffect(() => {
		let mounted = true
		async function fetchInputs() {
			try {
				await navigator.mediaDevices.getUserMedia({ audio: true })
				const devices = await navigator.mediaDevices.enumerateDevices()
				if (!mounted) return
				setMicrophones(devices.filter(d => d.kind === 'audioinput'))
			} catch (err) {
				console.error('Failed to list audio inputs:', err)
			}
		}
		fetchInputs()
		return () => { mounted = false }
	}, [])

	return [microphones, setMicrophones]
}
