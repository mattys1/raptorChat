import { Room } from "../../../structs/models/Models"
import { SERVER_URL } from "../../../api/routes"
import { useResourceFetcher } from "../useResourceFetcher"
import { useFetchAndListen } from "../useFetchAndListen"
import { useCallback } from "react"
//
export const useSidebarHook = () => {
	const onNewRoom = useCallback((setRooms: React.Dispatch<React.SetStateAction<Room[]>>, incoming: Room) => {
		setRooms((prev: Room[] | null) => [...prev ?? [], incoming])
	}, [])

	const [ownId] = useResourceFetcher<number>(0, "/api/user/me")
	const [rooms, setRooms] = useFetchAndListen<Room[], Room>(
		[],
		"/api/user/me/rooms",
		`user:${ownId}:rooms`,
		"joined_room",
		onNewRoom,
		Boolean(ownId),
		Boolean(ownId)
	)


	return {
		rooms,
		setRooms,
	}
}
