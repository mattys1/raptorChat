import { useNavigate, useParams } from "react-router-dom"
import { useVideoChatHook } from "../hooks/views/useVideoChatHook"
import { ConnectionState, ControlBar, GridLayout, LiveKitRoom, ParticipantTile, RoomAudioRenderer, RoomContext, TrackToggle, useTracks, VideoTrack } from "@livekit/components-react"
import { Track } from "livekit-client";
import MicToggleButton from "../components/MicToggleButton";
// import '@livekit/components-styles';
import ParticipantsGrid from "../components/ParticipantsGrid";

const MyVideoConference = () => {
	const tracks = useTracks(
		[
			{ source: Track.Source.Microphone, withPlaceholder: true },
			{ source: Track.Source.Camera, withPlaceholder: true },
			{ source: Track.Source.ScreenShare, withPlaceholder: true },
		],
		{ onlySubscribed: false },
	);

	return (
		<ParticipantsGrid tracks={tracks} />	
		// <GridLayout tracks={tracks} className="">
		// 	<ParticipantTile />
		// </GridLayout>
	);
}

const VideoChat = () => {
	const key = Number(useParams().chatId)
	const props = useVideoChatHook(key)
	const navigate = useNavigate()
	return <RoomContext.Provider value={props.room}>
		<div>
			<MyVideoConference />
			<ConnectionState />
			<RoomAudioRenderer />

			<div className="bottom-1/4">
				<ControlBar controls={{
					microphone: false,
					camera: false,
					screenShare: true,
					leave: false, 
					settings: false,
				}} 
				/>
				<TrackToggle source={Track.Source.Microphone} />
				<TrackToggle source={Track.Source.Camera} />
			</div>
		</div>
	</RoomContext.Provider>
{ /**
			serverUrl={"ws://localhost:7880"}
			token={props.livekitToken ?? ""}
			audio={true}
			video={false}
			connect={true}
			connectOptions={{ autoSubscribe: true }}
			onDisconnected={() => {
				navigate(-1) 
			}}
			onError={(error) => {
				console.error("Error connecting to livekit room", error)
			}}
			onConnected={() => {console.log("Connected to livekit room")}}
		**/}
}

export default VideoChat
