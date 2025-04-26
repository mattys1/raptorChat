import { useCallback } from "react";
import { Invite, InvitesState } from "../../structs/models/Models";
import { useSendEventMessage } from "../hooks/useSendEventMessage";

export const InviteReceived = (invite: Invite) => {
	const [acceptState, acceptError, acceptInvite] = useSendEventMessage(`/api/invites/${invite.id}`)
	const [rejectState, rejectError, rejectInvite] = useSendEventMessage(`/api/invites/${invite.id}`)

	const handleAccept = useCallback(() => {
		acceptInvite({
			channel: `user:${invite.receiver_id}:invites`,
			method: "PUT",
			event_name: "invite_accepted",
			contents: {
				id: invite.id,
				type: invite.type,
				state: InvitesState.Accepted,
				room_id: invite.room_id,
				issuer_id: invite.issuer_id,
				receiver_id: invite.receiver_id
			}
		})
	}, [invite, acceptInvite])
	
	const handleReject = useCallback(() => {
		rejectInvite({
			channel: `user:${invite.receiver_id}:invites`,
			method: "PUT",
			event_name: "invite_declined",
			contents: {
				id: invite.id,
				type: invite.type,
				state: InvitesState.Declined,
				room_id: invite.room_id,
				issuer_id: invite.issuer_id,
				receiver_id: invite.receiver_id
			}
		})
	}, [invite, rejectInvite])

	return <div>
		{`Invite from ${invite.issuer_id} to ${invite.receiver_id} for room ${invite.room_id}`}
		<br />
		<button onClick={handleAccept}>Accept</button>
		<button onClick={handleReject}>Reject</button>
	</div>
}
