import { useState } from "react"
import { useSendEventMessage } from "../useSendEventMessage"
import { useSendResource } from "../useSendResource"

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
