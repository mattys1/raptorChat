import { useParams } from "react-router-dom"
import { useInviteToChatroomHook } from "../hooks/views/useInviteToChatroomHook"
import IssueInvite from "../components/IssueInvite"

const InviteToChatroomView = () => {
	const roomId = Number(useParams().chatId)
	console.log("InviteToChatroomView roomId", roomId)
	const props = useInviteToChatroomHook(roomId)

	return <>
		Chatroom Invite<br/>
		{props.usersNotInRoom?.map(user => {
			return <IssueInvite user={user} type="group" roomId={roomId} />
		})}
	</>
}

export default InviteToChatroomView
