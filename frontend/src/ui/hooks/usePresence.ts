import { useEffect, useState } from "react"
import { CentrifugoService } from "../../logic/CentrifugoService"

export const usePresence = (channel: string) => {
	const [presence, setPresence] = useState<number[]>([])
	const [fetched, setFetched] = useState(false)

	useEffect(() => { 
		CentrifugoService.fetchPresence(channel).then((presenceData) => {
			const ids = Object.values(presenceData)
			.map(client => Number(client.user))

			setPresence(ids);
			setFetched(true)
			console.log("Presence data:", ids)
		})
	}, [channel])

	useEffect(() => {
		if(!fetched) return

		CentrifugoService.subscribe(channel).then((sub) => {
			sub.on("join", (ctx) => {
				console.log("User joined", ctx.info.user)
				setPresence((prev) => {
					return [...prev, Number(ctx.info.user)]
				})
			})
			sub.on("leave", (ctx) => {
				console.log("User left", ctx.info.user)
				setPresence((prev) => {
					return prev.filter((userId) => userId !== Number(ctx.info.user))
				})
			})
		})

		return () => {
			CentrifugoService.unsubscribe(channel)
		}
	}, [fetched])

	return [presence, setPresence]
}
