import { Room } from "../../../structs/models/Models"
import { SERVER_URL } from "../../../api/routes"
import { useResourceFetcher } from "../useResourceFetcher"
import { useFetchAndListen } from "../useFetchAndListen"
import { useCallback, useMemo } from "react"
//
export const useSidebarHook = () => {
	const onRoomEvent = useCallback((setRooms: React.Dispatch<React.SetStateAction<Room[]>>, incoming: Room, event: String) => {
		switch(event) {
			case "joined_room":
				setRooms((prev: Room[] | null) => [...prev ?? [], incoming])
				break
			case "room_deleted":
				console.log("Room deleted", incoming)
				setRooms(prev => {
					return prev.filter(room => {
						return room?.id !== incoming?.id
					})
				})
				break
			case "room_updated":
				setRooms(prev => {
					return prev.map(room => {
						if(room?.id === incoming?.id) {
							return incoming
						}
						return room
					})
				})
				break
			default:
				console.log("Unknown event", event)
		} 
	}, [])

	const ownId = localStorage.getItem("uID")
	const [rooms, setRooms] = useFetchAndListen<Room[], Room>(
		[],
		"/api/user/me/rooms",
		`user:${ownId}:rooms`,
		["joined_room", "room_deleted", "room_updated"],
		onRoomEvent,
	)

	return {
		rooms,
		setRooms,
	}
}
