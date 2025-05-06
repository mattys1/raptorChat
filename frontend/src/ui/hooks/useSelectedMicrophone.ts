import { useEffect, useState } from "react";

export const useSelectedMicrophone = (deviceId: string): {
	stream: MediaStream | null;
	error: Error | null;
} => {
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let mounted = true;

		async function getAudioStream() {
			try {
				if(stream) {
					stream.getTracks().forEach(track => track.stop());
				}

				const constraints = {
					audio: { deviceId: { exact: deviceId } }
				};

				const newStream = await navigator.mediaDevices.getUserMedia(constraints);
				if (mounted) setStream(newStream);
			} catch (err) {
				if (mounted) setError(err instanceof Error ? err : new Error('Unknown error'));
			}
		}

		getAudioStream();

		return () => {
			mounted = false;
			// Clean up the stream when component unmounts
			if (stream) {
				stream.getTracks().forEach(track => track.stop());
			}
		};
	}, [deviceId]);

	return { stream, error };
}
