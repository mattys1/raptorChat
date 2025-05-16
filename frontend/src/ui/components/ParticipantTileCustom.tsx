import { ParticipantAudioTile, TrackReference, VideoTrack } from "@livekit/components-react"
import { useUserInfo } from "../hooks/useUserInfo"

interface ParticipantTileCustomProps {
	id: number,
	tracks: {audio: TrackReference, camera: TrackReference, screenShare: TrackReference},
}

const ParticipantTileCustom = ({id, tracks}: ParticipantTileCustomProps) => {
	const [user] = useUserInfo(id)

	console.log("track is muted", tracks.camera.publication?.isMuted)
	return (
		<div className="w-full">
			{
				tracks.camera.publication?.isMuted || !tracks.camera.publication ? (
					tracks.screenShare.publication?.isMuted || !tracks.screenShare.publication ? (
						<ParticipantAudioTile className="w-full" trackRef={tracks.audio}/>
					) : (
							<VideoTrack className="w-full" trackRef={tracks.screenShare} />
						)
				) : (
						<VideoTrack className="w-full" trackRef={tracks.camera} />
					)
			}

			{
			}
			{user.username}
		</div>
	)
}

export default ParticipantTileCustom
