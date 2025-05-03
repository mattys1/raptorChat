import { useParams } from "react-router-dom"
import { useVideoChatHook } from "../hooks/views/useVideoChatHook"

const VideoChat = () => {
	const key = Number(useParams().chatId)
	const props = useVideoChatHook(key)
	return <>
		Video chat
		<audio ref={props.audio} autoPlay controls onPlay={props.listen}>

		</audio>
	</>
}

export default VideoChat
