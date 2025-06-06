import { useEffect, useState } from "react"
import { User } from "../../structs/models/Models"
import { useResourceFetcher } from "./useResourceFetcher"

export const useUserInfo = (userId: number): [User, string, React.Dispatch<React.SetStateAction<User>>] => {
	const [info, setInfo] = useResourceFetcher<User>({
		id: 0,
		username: "",
		email: "",
		created_at: new Date(),
	},`/api/user/${userId}`)

	// const avatar = `http://localhost:8080/${info.avatar_url}`
	const [avatar, setAvatar] = useState<string>("") // default here

	useEffect(() => {
		setAvatar(info.avatar_url ? `http://localhost:8080/${info.avatar_url}` : "/default-avatar.png")
	}, [info.avatar_url])

	return [
		info,
		avatar,
		setInfo
	]
}
