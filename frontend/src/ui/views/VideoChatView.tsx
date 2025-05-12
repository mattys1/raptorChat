import { useNavigate, useParams } from "react-router-dom"
import { useVideoChatHook } from "../hooks/views/useVideoChatHook"
import { ConnectionState, ControlBar, GridLayout, LiveKitRoom, ParticipantTile, RoomAudioRenderer, RoomContext, useTracks } from "@livekit/components-react"
import { Track } from "livekit-client";

const MyVideoConference = () => {
	// `useTracks` returns all camera and screen share tracks. If a user
	// joins without a published camera track, a placeholder track is returned.
	const tracks = useTracks(
		[
			{ source: Track.Source.Microphone, withPlaceholder: true },
		],
		{ onlySubscribed: false },
	);
	return (
		<GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
			{/* The GridLayout accepts zero or one child. The child is used
	  as a template to render all passed in tracks. */}
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
        {/* Controls for the user to start/stop audio, video, and screen share tracks */}
		<ControlBar />
		{/**
			<audio ref={props.audio} autoPlay controls onPlay={props.listen}>
			</audio>
		**/}
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
