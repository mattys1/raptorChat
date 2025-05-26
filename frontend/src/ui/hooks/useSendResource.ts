import { useState, useCallback } from "react";
import { SERVER_URL } from "../../api/routes";

const HttpMethod = {
	GET: "GET",
	POST: "POST",
	PUT: "PUT",
	PATCH: "PATCH",
	DELETE: "DELETE",
}

export type HttpMethods = typeof HttpMethod[keyof typeof HttpMethod];

const ResponseStates = {
	SUCCESS: "SUCCESS",
	FAILURE: "FAILURE",
	PENDING: "PENDING",
} as const

type ResponseStates = typeof ResponseStates[keyof typeof ResponseStates];

export const useSendResource = <T>(
	endpoint: string,
	method: HttpMethods,
): [ResponseStates, string | null, (message: T) => Promise<T | null>] => {
	const [state, setState] = useState<ResponseStates>(ResponseStates.PENDING);
	const [error, setError] = useState<string | null>(null);

	const sendMessage = useCallback(async (message: T) => {
		setState(ResponseStates.PENDING);
		try {
			const res = await fetch(SERVER_URL + endpoint, {
				method: method,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify(message),
			});

			if(!res.ok) {
				throw new Error(`Error sending message: ${res.statusText}`);
			}

			const data = String(res.body) ? null : await res.json() as T // retarted
			setState(ResponseStates.SUCCESS);
			return data;
		} catch (err) {
			setState(ResponseStates.FAILURE);
			setError(err instanceof Error ? err.message : String(err));
			return null;
		}
	}, [endpoint]);

	return [state, error, sendMessage];
}
