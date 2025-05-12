import { EventResource } from "../../structs/Message"
import { Invite, InvitesType, User } from "../../structs/models/Models"
import { useSendEventMessage } from "../hooks/useSendEventMessage"

interface IssueInviteProps {
  user: User
  type: InvitesType
  roomId?: number | null
}

const IssueInvite: React.FC<IssueInviteProps> = ({ user, type, roomId = null }) => {
	const [_, err, sendInvite] = useSendEventMessage<Invite>("/api/invites")
	const ownId = Number(localStorage.getItem("uID"))

	return <div key={user.id}>
		{user.username} {err}
		<button onClick={() => {
			sendInvite({
				channel: `user:${user.id}:invites`,
				method: "POST",
				event_name: "invite_sent",
				contents: {
					id: 0,
					type: type,
					state: "pending",
					room_id: roomId,
					issuer_id: ownId, //TODO: may be better to check this in the backend
					receiver_id: user.id
				}
			} as EventResource<Invite>)
		}}>Invite</button>
	</div>
}

export default IssueInvite
