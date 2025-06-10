import { useCallback } from "react";
import { Invite } from "../../../structs/models/Models"
import { useFetchAndListen } from "../useFetchAndListen"

type InviteUpdateCallback = (
	setState: React.Dispatch<React.SetStateAction<Invite[]>>, 
	incoming: Invite,
	event: string
) => void;

export const useUserInvitesHook = () => {
	const uid = localStorage.getItem("uID")
	const handleInviteUpdates = useCallback<InviteUpdateCallback>((setInvites, incoming, event) => {
		switch(event) {
			case "invite_sent":
				setInvites((prev) => [...prev ?? [], incoming]);
				break;
			case "invite_accepted": 
			case "invite_declined":
				setInvites((prev) => {
					return prev?.filter(invite => invite.id !== incoming.id)
				});
				break;
		}
	}, [])
	const [invites] = useFetchAndListen<Invite[], Invite>(
		[],
		`/api/user/${uid}/invites`,
		`user:${uid}:invites`,
		["invite_sent", "invite_accepted", "invite_declined"],
		handleInviteUpdates,
		Boolean(uid),
		Boolean(uid)
	)

	return {
		invites,
		handleNewInvites: handleInviteUpdates
	}
}
