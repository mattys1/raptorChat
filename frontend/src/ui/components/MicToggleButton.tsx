import { useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";

export const MicToggleButton = () => {
	const { localParticipant } = useLocalParticipant();

	const toggleMicrophone = () => {
		if (localParticipant?.isMicrophoneEnabled) {
			localParticipant.setMicrophoneEnabled(false);
		} else {
			localParticipant.setMicrophoneEnabled(true);

			console.log('mic id', localStorage.getItem('selectedMicrophone'));
			console.log('streaming track', localParticipant.getTrackPublication(Track.Source.Microphone))
		}

	};

	return (
		<button 
			onClick={toggleMicrophone} 
		>
			{localParticipant?.isMicrophoneEnabled ? 'Mute' : 'Unmute'}
		</button>
	);
};

export default MicToggleButton;
