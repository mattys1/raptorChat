import { useId } from "react"
import { EventResource } from "../../structs/Message"
import { Room, RoomsType } from "../../structs/models/Models"
import { useCreateRoomHook } from "../hooks/views/useCreateRoomHook"

const CreateRoomView = () => {
	const props = useCreateRoomHook()
	const uID = Number(localStorage.getItem("uID"))

	return <div>
		<h1>Create Room</h1>
		<form onSubmit={(e) => {
			e.preventDefault()
			const formData = new FormData(e.currentTarget)
			const name = String(formData.get("name"))

			props.createRoom({
				channel: `user:${uID}:rooms`,	
				method: "POST",
				event_name: "create_room",
				contents: {
					id: 0,
					name: name,
					owner_id: uID,
					type: RoomsType.Group
				} as Room
			} as EventResource<Room>)
		}}>
			<div>
				<label htmlFor="name">Room Name:</label>
				<input type="text" id="name" name="name" required />
			</div>
			<button type="submit">Create Room</button>
		</form>

		{props.createRoomStatus === "FAILURE" && <p>Error: {props.error}</p>}
		{props.createRoomStatus === "SUCCESS" && <p>Room created successfully!</p>}
	</div>
}

export default CreateRoomView
