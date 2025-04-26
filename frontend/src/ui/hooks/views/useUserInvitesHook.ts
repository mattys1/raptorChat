import { useCallback } from "react";
import { Invite } from "../../../structs/models/Models"
import { useFetchAndListen } from "../useFetchAndListen"
import { useResourceFetcher } from "../useResourceFetcher"

type InviteUpdateCallback = (
	setState: React.Dispatch<React.SetStateAction<Invite[]>>, 
	incoming: Invite
) => void;

export const useUserInvitesHook = () => {
	const [uid] = useResourceFetcher<number>(0, "/api/user/me") // TODO: uid should be gotten in the beggining of the session

	const handleNewInvites = useCallback<InviteUpdateCallback>((setInvites, incoming) => {
		setInvites((prev) => [...prev ?? [], incoming]);
	}, [])
	const [invites] = useFetchAndListen<Invite[], Invite>(
		[],
		`/api/user/${uid}/invites`,
		`user:${uid}:invites`,
		"invite_sent",
		handleNewInvites,
		Boolean(uid),
		Boolean(uid)
	)

	return {
		invites,
		handleNewInvites
	}
}
