import { useSendResource } from "../useSendResource"

interface ChangePassword {
	new_password: string
	old_password: string
}

export const useChangePasswordHook = () => {
	const [cPasswordStat, error, changePassword] = useSendResource<ChangePassword>(
		"/api/user/me/password",
		"PATCH",
	)

	return {
		cPasswordStat,
		changePassword,
		error
	}
}
