import { useParams } from "react-router-dom"
import { EventResource } from "../../structs/Message"
import { Invite } from "../../structs/models/Models"
import { useInviteToChatroomHook } from "../hooks/views/userInviteToChatroomHook"

const InviteToChatroomView = () => {
	const roomId = Number(useParams().chatId)
	console.log("InviteToChatroomView roomId", roomId)
	const props = useInviteToChatroomHook(roomId)

	return <>
		Chatroom Invite<br/>
		{props.usersNotInRoom?.map(user => {
			return <div key={user.id}>
				{user.username}
				<button onClick={() => {
					props.sendInvite({
						channel: `user:${user.id}:invites`,
						method: "POST",
						event_name: "invite_sent",
						contents: {
							id: 0,
							type: "group",
							state: "pending",
							room_id: roomId,
							issuer_id: props.ownId, //TODO: may be better to check this in the backend
							receiver_id: user.id
						}
					} as EventResource<Invite>)
				}}>Invite</button>
			</div>
		})}
	</>
}

export default InviteToChatroomView
