import { User } from "../../structs/models/Models"
import { useResourceFetcher } from "./useResourceFetcher"

export const useUserInfo = (userId: number): [User, React.Dispatch<React.SetStateAction<User>>] => {
	const [info, setInfo] = useResourceFetcher<User>({
		id: 0,
		username: "",
		email: "",
		created_at: new Date(),
	},`/api/user/${userId}`)

	return [
		info,
		setInfo
	]
}
