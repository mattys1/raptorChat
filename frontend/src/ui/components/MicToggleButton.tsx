import { useLocalParticipant } from "@livekit/components-react";

export const MicToggleButton = () => {
	const { localParticipant } = useLocalParticipant();

	const toggleMicrophone = () => {
		if (localParticipant?.isMicrophoneEnabled) {
			localParticipant.setMicrophoneEnabled(false);
		} else {
			localParticipant.setMicrophoneEnabled(true);
		}
	};

	return (
		<button 
			onClick={toggleMicrophone} 
		>
			{localParticipant?.isMicrophoneEnabled ? 'Unmute' : 'Mute'}
		</button>
	);
};
