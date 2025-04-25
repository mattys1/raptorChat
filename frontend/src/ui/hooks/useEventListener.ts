import React, { useEffect, useState } from "react"
import { CentrifugoService } from "../../logic/CentrifugoService"

export const useEventListener = <T>(
	initial: T,
	channel: string,
	event: string,
	callback: (setState: React.Dispatch<React.SetStateAction<T>>, incoming: T) => void
): [T, React.Dispatch<React.SetStateAction<T>>] => {
	const [state, setState] = useState<T>(initial)

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

	return [state, setState]
}
