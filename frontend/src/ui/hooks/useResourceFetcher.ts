import { useEffect, useState } from "react"
import { err, ok, ResultAsync } from "neverthrow"

export const useResourceFetcher = <T>(initial: T, endpoint: string) => {
	const [state, setState] = useState<T>(initial)
	
	const payload = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${localStorage.getItem("token")}`,
		},
	}

	useEffect(() => {
		fetch(endpoint, payload).then( async response => {
			if(!response.ok) {
				return err(new Error(`HTTP error! status: ${response.status}`))
			}
			return ok(await response.json())
		}).then(value => {
				value.match(
					async (okValue) => {
						const data = await okValue as T
						setState(data)
					},
					(errValue) => {
						console.error("Fetch error:", errValue)
					}
				)
			})
	}, [])

	return [
		state,
		setState,
	]
}
