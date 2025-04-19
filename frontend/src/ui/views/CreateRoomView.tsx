import { MessageEvents } from "../../structs/MessageNames"
import { Room, RoomsType } from "../../structs/models/Models"
import { useCreateRoomHook } from "../hooks/useCreateRoomHook"
import "./Start.css"

const CreateRoomView = () => {
	const props = useCreateRoomHook()

	return <>
		<>Create room!!!!</>
		<form action={(input) => {
			const roomName = input.get("messageBox")?.toString()
			props.sender.createResource([{
				id: 0,
				name: roomName ?? "Unknown",
				owner_id: 0,
				type: RoomsType.group,
			}] as Room[], MessageEvents.ROOMS)
		}}>
			<input name="messageBox" />
			<button>Wyslij pan</button>
		</form>
	</> 
}

export default CreateRoomView
