import { ParticipantAudioTile, ParticipantTile, TrackReference, VideoTrack } from "@livekit/components-react"
import { useUserInfo } from "../hooks/useUserInfo"
import { Participant, Track, TrackPublication } from "livekit-client"

interface ParticipantTileCustomProps {
	id: number,
	tracks: {audio: TrackReference, video: TrackReference},
}

const ParticipantTileCustom = ({id, tracks}: ParticipantTileCustomProps) => {
	const [user] = useUserInfo(id)

	console.log("track is muted", tracks.video.publication?.isMuted)
	return (
		<div className="w-full">
			{
				tracks.video.publication?.isMuted || !tracks.video.publication ? (
					<ParticipantAudioTile className="w-full" trackRef={tracks.audio}/>
				) : (
					<VideoTrack className="w-full" trackRef={tracks.video} />
				)
			}
			{user.username}
		</div>
	)
}

export default ParticipantTileCustom
