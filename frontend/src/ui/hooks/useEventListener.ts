import React, { useEffect, useState } from "react"
import { CentrifugoService } from "../../logic/CentrifugoService"
import { EventResource } from "../../structs/Message"

export const useEventListener = <T>(
	// initial: T,
	channel: string,
	event: string,
	// callback: (setState: React.Dispatch<React.SetStateAction<T>>, incoming: U) => void
): [T | null, React.Dispatch<React.SetStateAction<T | null>>] => {
	const [state, setState] = useState<T | null>(null)
	console.log("Rerendering useEventListerner", state)

	useEffect(() => {
		console.log("Attempting to hook into event", event)
		const sub = CentrifugoService.subscribe(channel).then((sub) => {
			sub.on("publication", (ctx) => {
				const incoming = ctx.data as EventResource<T>
				console.log("Received publication", ctx)
				if(incoming.event_name === event) {
					console.log("Published", ctx)
					// callback(setState, ctx.data.data)
					setState(incoming.contents as T) // TODO: assuming contents is T for now
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
			sub.then(() => {
				CentrifugoService.unsubscribe(channel)
			})
		}
	}, [channel, event])

	return [state, setState]
}
