import { InviteReceived } from "../components/ReceivedInvite";
import { useUserInvitesHook } from "../hooks/views/useUserInvitesHook";

const UserInvitesView = () => {
	const props = useUserInvitesHook()
	return <>
		{props.invites?.map(invite => {
			return <InviteReceived key={invite?.id} {...invite} />
		})}
	</>
}

export default UserInvitesView;
