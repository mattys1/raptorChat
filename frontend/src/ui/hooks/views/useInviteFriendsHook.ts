import { useCallback } from "react"
import { useFetchAndListen } from "../useFetchAndListen"
import { User } from "../../../structs/models/Models"
import { useResourceFetcher } from "../useResourceFetcher"


export const useInviteFriendsHook = (uID: number) => {
	const onNewFriend = useCallback((
	setFriends: React.Dispatch<React.SetStateAction<User[]>>, incoming: User) => {
		setFriends((prev: User[] | null) => [...prev ?? [], incoming])
	}, [])

	const [friends] = useFetchAndListen<User[], User>(
		[],
		`/api/user/${uID}/friends`,
		`user:${uID}:friends`,
		["friend_added"],
		onNewFriend
	)

	// TODO: temp
	const [allUsers] = useResourceFetcher<User[]>(
		[],
		`/api/user`,
	)

	return {
		nonFriends: allUsers.filter(u => {
			return !friends.some(f => f?.id === u?.id)
		})
	}
}
