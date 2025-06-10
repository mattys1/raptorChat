import { useEffect, useState } from "react"
import { User } from "../../structs/models/Models"
import { useFetchAndListen } from "./useFetchAndListen"

export const useUserInfo = (userId: number): [User, string, React.Dispatch<React.SetStateAction<User>>] => {
	const [info, setInfo] = useFetchAndListen<User, User>({
		id: 0,
		username: "",
		email: "",
		created_at: new Date(),
	},`/api/user/${userId}`,
		`user:${userId}`,
		["update_user"],
		(setState, incoming, event) => {
			switch (event) {
				case "update_user":
					setState(incoming)
					break
				default:
					console.warn(`Unhandled event type: ${event}`)
					break
			}
		}
	)

	const [avatar, setAvatar] = useState<string>("") // default here

	useEffect(() => {
		if (info.avatar_url) {
			setAvatar(`http://localhost:8080/${info.avatar_url}`)
		}	
	})

	useEffect(() => {
		setAvatar(info.avatar_url ? `http://localhost:8080/${info.avatar_url}` : "/default-avatar.png")
	}, [info.avatar_url])

	return [
		info,
		avatar,
		setInfo
	]
}
