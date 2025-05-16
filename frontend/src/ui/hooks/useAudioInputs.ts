import { useEffect, useState } from "react"

interface useAudioInputProps {
	constraints: MediaStreamConstraints
	deviceKind: string
}

export const useMediaInputs = ({
	constraints,
	deviceKind
}: useAudioInputProps): [ 
	microphones: MediaDeviceInfo[],
	setMicrophones: React.Dispatch<React.SetStateAction<MediaDeviceInfo[]>> 
] => {
	const [mediaInputs, setMediaInputs] = useState<MediaDeviceInfo[]>([])

	useEffect(() => {
		let mounted = true
		async function fetchInputs() {
			try {
				await navigator.mediaDevices.getUserMedia(constraints)
				const devices = await navigator.mediaDevices.enumerateDevices()
				if (!mounted) return
				setMediaInputs(devices.filter(d => d.kind === deviceKind))
			} catch (err) {
				console.error('Failed to list audio inputs:', err)
			}
		}
		fetchInputs()
		return () => { mounted = false }
	}, [])

	return [mediaInputs, setMediaInputs]
}
