import { useChangePasswordHook } from "../hooks/views/useChangePasswordHook"

const ChangePasswordView = () => {
	const props = useChangePasswordHook()

	return (
		<div>
			<h1>Change Password</h1>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					props.changePassword({
						old_password: e.currentTarget.oldPassword.value,
						new_password: e.currentTarget.newPassword.value,
					})
				}}
			>
				<label>
					Old Password:
					<input type="password" name="oldPassword" required />
				</label>
				<br />
				<label>
					New Password:
					<input type="password" name="newPassword" required />
				</label>
				<br />
				<button type="submit">Change Password</button>
			</form>
			{props.cPasswordStat === "SUCCESS" && <p>Password changed successfully!</p>}
			{props.cPasswordStat === "FAILURE" && <p>Error changing password: {props.error}</p>}
		</div>
	)
}

export default ChangePasswordView
