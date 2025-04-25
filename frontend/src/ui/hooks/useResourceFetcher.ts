import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { err, ok, Result, ResultAsync } from "neverthrow"
import { SERVER_URL } from "../../api/routes"

export const useResourceFetcher = <T>(
	initial: T,
	endpoint: string
): [T, Dispatch<SetStateAction<T>>] => {
	const [state, setState] = useState<T>(initial)
	
	const payload = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${localStorage.getItem("token")}`,
		},
	}

	useEffect(() => {
		console.log("Fetching resource from:", endpoint)
		fetch(SERVER_URL + endpoint, payload).then( async response => {
			if(!response.ok) {
				console.error(`HTTP error! status: ${response.status}`)
				return err(new Error(`HTTP error! status: ${response.status}`))
			}
			console.log("Response:", response)
			try {
				const data = await response.json()
				console.log("Response JSON:", data)
				return ok(data)
			} catch (error) {
				console.error("Error parsing JSON:", error)
				return err(new Error(`JSON parsing error: ${error}`))
			}
		}).then(result => {
				result.match(
					(okValue) => {
						setState(okValue as T)
					},
					(errValue) => {
						console.error("Fetch error:", errValue)
					}
				)
			})
	}, [endpoint])

	return [
		state,
		setState,
	]
}
