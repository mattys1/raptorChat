import { useCallback, useEffect } from "react";
import { Invite } from "../../../structs/models/Models"
import { useFetchAndListen } from "../useFetchAndListen"
import { useResourceFetcher } from "../useResourceFetcher"
import { useEventListener } from "../useEventListener";

type InviteUpdateCallback = (
	setState: React.Dispatch<React.SetStateAction<Invite[]>>, 
	incoming: Invite
) => void;

export const useUserInvitesHook = () => {
	const uid = localStorage.getItem("uID")
	const handleNewInvites = useCallback<InviteUpdateCallback>((setInvites, incoming) => {
		setInvites((prev) => [...prev ?? [], incoming]);
	}, [])
	const [invites, setInvites] = useFetchAndListen<Invite[], Invite>(
		[],
		`/api/user/${uid}/invites`,
		`user:${uid}:invites`,
		"invite_sent",
		handleNewInvites,
		Boolean(uid),
		Boolean(uid)
	)
	const [invitesAccepted] = useEventListener<Invite>(
		// [],
		// `/api/user/${uid}/invites`,
		`user:${uid}:invites`,
		"invite_accepted",
		// handleNewInvites,
		// Boolean(uid),
		// Boolean(uid)
	)
	const [invitesRejected] = useEventListener<Invite>(
		// [],
		// `/api/user/${uid}/invites`,
		`user:${uid}:invites`,
		"invite_declined",
		// handleNewInvites,
		// Boolean(uid),
		// Boolean(uid)
	)

	useEffect(() => {
		console.log("Invites accepted", invitesAccepted)
		console.log("Invites rejected", invitesRejected)
		setInvites((prev) => {
			return prev.filter(inv => {
				return inv?.id !== invitesAccepted?.id && inv?.id !== invitesRejected?.id
			})
		})
	}, [invitesAccepted, invitesRejected])

	return {
		invites,
		handleNewInvites
	}
}
