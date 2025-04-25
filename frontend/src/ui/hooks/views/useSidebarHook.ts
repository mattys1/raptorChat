import { Room } from "../../../structs/models/Models"
import { SERVER_URL } from "../../../api/routes"
import { useResourceFetcher } from "../useResourceFetcher"
//
export const useSidebarHook = () => {
	const [rooms, setRooms] = useResourceFetcher<Room[]>([], "/api/user/me/rooms")

	return {
		rooms,
		setRooms,
	}
}
