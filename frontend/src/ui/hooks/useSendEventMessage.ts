import { useState, useCallback } from "react";
import { EventResource } from "../../structs/Message";
import { SERVER_URL } from "../../api/routes";

const ResponseStates = {
	SUCCESS: "SUCCESS",
	FAILURE: "FAILURE",
	PENDING: "PENDING",
} as const

type ResponseStates = typeof ResponseStates[keyof typeof ResponseStates];

export const useSendEventMessage = <T>(
	endpoint: string,
): [ResponseStates, string | null, (message: EventResource<T>) => Promise<EventResource<T> | null>]=> {
	const [state, setState] = useState<ResponseStates>(ResponseStates.PENDING);
	const [error, setError] = useState<string | null>(null);

	const sendMessage = useCallback(async (message: EventResource<T>,) => {
		setState(ResponseStates.PENDING);
		try {
			const res = await fetch(SERVER_URL + endpoint, {
				method: message.method,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify(message),
			});

			if(!res.ok) {
				throw new Error(`Error sending message: ${res.statusText}`);
			}

			const data = String(res.body) ? null : await res.json() as EventResource<T>;
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
