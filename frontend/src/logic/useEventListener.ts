import { useEffect, useState } from "react"
import { CentrifugoService } from "./CentrifugoService"

export const useEventListener = <T>(
	channel: string,
	event: string,
	callback: (setState: React.Dispatch<React.SetStateAction<T | null>>, incoming: T) => void
) => {
	const [state, setState] = useState<T | null>(null)

	useEffect(() => {
		console.log("Attempting to hook into event", event)
		const sub = CentrifugoService.subscribe(channel).then((sub) => {
			console.log("executing sub promise")
			sub.on("publication", (ctx) => {
				if(ctx.data.event === event) {
					console.log("Published", ctx)
					callback(setState, ctx.data.data)
				}
			})
			.on("subscribed", () => {
				console.log(`Subscribed to ${channel}`)
			})
			.on("subscribing", () => {
				console.log(`Subscribing to ${channel}`)
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
	}, [channel, event, callback])

	return state
}
