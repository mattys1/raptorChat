import { useNavigate, useParams } from "react-router-dom"
import { useVideoChatHook } from "../hooks/views/useVideoChatHook"
import { LiveKitRoom } from "@livekit/components-react"

const VideoChat = () => {
	console.log(useParams().chatId)
	const key = Number(useParams().chatId)
	const props = useVideoChatHook(key)
	const navigate = useNavigate()
	return <LiveKitRoom
		serverUrl={"localhost:7880"}
		token={props.livekitToken ?? ""}
		audio={true}
		video={false}
		connectOptions={{ autoSubscribe: true }}
		onDisconnected={() => {
			navigate(-1) 
		}}
	>
		Video chat
		<audio ref={props.audio} autoPlay controls onPlay={props.listen}>
	
		</audio>
	</LiveKitRoom>
}

export default VideoChat
