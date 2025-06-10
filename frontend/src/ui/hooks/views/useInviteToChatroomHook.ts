import { useResourceFetcher } from "../useResourceFetcher"
import { User } from "../../../structs/models/Models"

export const useInviteToChatroomHook = (roomId: number) => {
	const [allUsers] = useResourceFetcher<User[]>([], "/api/user")
	const [usersInRoom] = useResourceFetcher<User[]>([], `/api/rooms/${roomId}/user`)
	const [ownId] = useResourceFetcher<number>(0, "/api/user/me")

	return {
		usersNotInRoom: allUsers.filter(user => !usersInRoom.some(u => u.id === user.id)),
		ownId,
	}
}
