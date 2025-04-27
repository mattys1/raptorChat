import { Room } from "../../../structs/models/Models"
import { useSendEventMessage } from "../useSendEventMessage"

export const useCreateRoomHook = () => {
	const [createRoomStatus, error, createRoom] = useSendEventMessage<Room>(`/api/rooms`)

	return {
		createRoomStatus,
		error,
		createRoom,
	}
}
