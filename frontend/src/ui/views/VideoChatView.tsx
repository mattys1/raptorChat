import { useNavigate, useParams } from "react-router-dom"
import { useVideoChatHook } from "../hooks/views/useVideoChatHook"
import { ConnectionState, ControlBar, GridLayout, LiveKitRoom, ParticipantTile, RoomAudioRenderer, RoomContext, TrackToggle, useTracks } from "@livekit/components-react"
import { Track } from "livekit-client";
import MicToggleButton from "../components/MicToggleButton";

const MyVideoConference = () => {
	const tracks = useTracks(
		[
			{ source: Track.Source.Microphone, withPlaceholder: true },
		],
		{ onlySubscribed: false },
	);
	return (
		<GridLayout tracks={tracks}>
			<ParticipantTile />
		</GridLayout>
	);
}

const VideoChat = () => {
	const key = Number(useParams().chatId)
	const props = useVideoChatHook(key)
	const navigate = useNavigate()
	return <RoomContext.Provider value={props.room}>
		<MyVideoConference />
		<ConnectionState />
		<RoomAudioRenderer />
		<ControlBar controls={{
			microphone: false,
			camera: false,
			screenShare: false,
			leave: true, 
			settings: false,
		}} 
		/>
		<TrackToggle source={Track.Source.Microphone}/>
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
