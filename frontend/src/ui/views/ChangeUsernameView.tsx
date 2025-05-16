import { EventResource } from "../../structs/Message"
import { useChangeUsernameHook } from "../hooks/views/useChangeUsernameHook"

const ChangeUsernameView = () => {
	const props = useChangeUsernameHook()

	return (
		<div>
			<h1>Change Username</h1>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					props.changeUsername({
						channel: `user:${props.userId}`,
						method: "PATCH",	
						event_name: "username_changed",
						contents: e.currentTarget.newUsername.value
					} as EventResource<String>)
				}}
			>
				<label>
					New Username:
					<input name="newUsername" required />
				</label>
				<br />
				<button type="submit">Change Username</button>
			</form>
			{props.cUsernameState === "SUCCESS" && <p>Username changed successfully!</p>}
			{props.cUsernameState === "FAILURE" && <p>Error changing password: {props.error}</p>}
		</div>
	)
}

export default ChangeUsernameView 
