import { useUserInvitesHook } from "../hooks/views/useUserInvitesHook";

const UserInvitesView = () => {
	const props = useUserInvitesHook()
	return <>
		{props.invites?.map(invite => {
			return <div key={invite?.id}>
				{`Issuer id: ${invite?.issuer_id}, Room id: ${invite?.room_id}`}
			</div>
		})}
	</>
}

export default UserInvitesView;
