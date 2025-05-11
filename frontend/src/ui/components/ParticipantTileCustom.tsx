import { ParticipantAudioTile, ParticipantTile, TrackReference, VideoTrack } from "@livekit/components-react"
import { useUserInfo } from "../hooks/useUserInfo"
import { Participant, Track, TrackPublication } from "livekit-client"

interface ParticipantTileCustomProps {
	id: number,
	tracks: {audio: TrackReference, video: TrackReference},
}

const ParticipantTileCustom = ({id, tracks}: ParticipantTileCustomProps) => {
	const [user, setUserInfo] = useUserInfo(id)

	console.log("track is muted", tracks.video.publication?.isMuted)
	return (
		<div>
			{
				tracks.video.publication?.isMuted ? (
					<ParticipantAudioTile trackRef={tracks.audio}/>
				) : (
					<VideoTrack className="max-w-full max-h-full" trackRef={tracks.video} />
				)
			}
			{user.username}
		</div>
	)
}

export default ParticipantTileCustom
