import { useEffect, useState } from "react"
import { useResourceFetcher } from "./useResourceFetcher"
import { useEventListener } from "./useEventListener"

export const useFetchAndListen = <T, U>(
	initial: T,
	endpoint: string,
	channel: string,
	events: string[],
	callback: (setState: React.Dispatch<React.SetStateAction<T>>, incoming: U, event: string) => void,
	shouldFetch: boolean = true,
	shouldListen: boolean = true
): [T, React.Dispatch<React.SetStateAction<T>>] => {
	const [state, setState] = useState<T>(initial)
	const [fetched, setFetched] = useState(false)
	const [fetchedData] = useResourceFetcher<T>(initial, endpoint)
	const [newest] = useEventListener<U>(channel, events)

	useEffect(() => {
		if (!shouldFetch) return
		setState(fetchedData)
		setFetched(true)
	}, [fetchedData, shouldFetch])

	// useEffect(() => {
	// 	if(!fetched) return
	// 	callback(setState, eventData)
	// }, [fetched])

	useEffect(() => {
		if(
			!fetched && 
			newest.event === "" ||
			newest.item === null 
		) {return}
		if(!shouldListen) return

		console.log("New event", newest)

		callback(setState, newest.item!, newest.event)
	}, [fetched, shouldListen, newest])

	return [state, setState]
}
