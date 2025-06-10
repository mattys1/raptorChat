import { useState } from "react"
import { useSendEventMessage } from "../useSendEventMessage"

export const useChangeUsernameHook = () => {
	const [cUsernameState, error, changeUsername] = useSendEventMessage("/api/user/me/username")
	const [userId] = useState(localStorage.getItem("userId"))

	return {
		cUsernameState,
		changeUsername,
		error,
		userId
	}
}
