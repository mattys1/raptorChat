import React, { useEffect, useState } from "react"
import { CentrifugoService } from "../../logic/CentrifugoService"
import { EventResource } from "../../structs/Message"

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
		CentrifugoService.subscribe(channel).then((sub) => {
			sub.on("publication", (ctx) => {
				const incoming = ctx.data as EventResource<T>
				console.log("Received publication", ctx)
				if(events.includes(incoming.event_name)) {
					console.log("Published", ctx)
					// callback(setState, ctx.data.data)
					setState({
						event: incoming.event_name,
						item: incoming.contents as T
					}) // TODO: assuming contents is T for now
				}
			})
			.on("subscribed", () => {
				console.log(`Subscribed to ${channel}`)
			})
			.on("error", (ctx) => {
				console.error("Error subscribing", ctx.error)
			})
		}).catch(err => {
			console.error(err)
		}).finally(() => { console.log("sub promise finished") })

		return () => {
			CentrifugoService.unsubscribe(channel)
		}
	}, [channel])

	return [state, setState]
}
