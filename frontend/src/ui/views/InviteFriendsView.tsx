import { useParams } from "react-router-dom"
import { useInviteToChatroomHook } from "../hooks/views/useInviteToChatroomHook"
import IssueInvite from "../components/IssueInvite"
import { useInviteFriendsHook } from "../hooks/views/useInviteFriendsHook"

const InviteFriendsView = () => {
	const roomId = Number(useParams().chatId)
	console.log("InviteToChatroomView roomId", roomId)
	const props = useInviteFriendsHook(roomId)

	return <>
		Invite Friend<br/>
		{props.nonFriends.map(user => {
			return <IssueInvite user={user} type="direct" roomId={roomId} />
		})}
	</>
}

export default InviteFriendsView
