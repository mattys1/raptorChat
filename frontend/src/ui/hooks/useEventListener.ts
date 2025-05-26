import React, { useEffect, useState } from "react"
import { CentrifugoService } from "../../logic/CentrifugoService"

interface EventAndItem<T> {
	event: string
	item: T | null
}

export const useEventListener = <T>(
	// initial: T,
	channel: string,
	events: string[],
	// callback: (setState: React.Dispatch<React.SetStateAction<T>>, incoming: U) => void
): [EventAndItem<T | null>, React.Dispatch<React.SetStateAction<EventAndItem<T | null>>>] => {
	const [state, setState] = useState<EventAndItem<T | null>>({
		event: "",
		item: null
	})
	console.log("Rerendering useEventListerner", state)

	useEffect(() => {
		console.log("Attempting to hook into event", events)

		return () => {
			CentrifugoService.unsubscribe(channel)
		}
	}, [channel])

	return [state, setState]
}
