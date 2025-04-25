import { useEffect, useState } from "react"
import { useResourceFetcher } from "./useResourceFetcher"
import { useEventListener } from "./useEventListener"

export const useFetchAndListen = <T, U>(
	initial: T,
	endpoint: string,
	channel: string,
	event: string,
	callback: (setState: React.Dispatch<React.SetStateAction<T>>, incoming: U) => void 
): [T, React.Dispatch<React.SetStateAction<T>>] => {
	const [state, setState] = useState<T>(initial)
	const [fetched, setFetched] = useState(false)
	const [fetchedData, setFetchedData] = useResourceFetcher<T>(initial, endpoint)
	const [eventData, setEventData] =  useEventListener<U>(channel, event)	

	useEffect(() => {
		setState(fetchedData)
		setFetched(true)
	}, [fetchedData])

	// useEffect(() => {
	// 	if(!fetched) return
	// 	callback(setState, eventData)
	// }, [fetched])

	useEffect(() => {
		// Only process events after initial fetch completes
		if (!fetched && eventData) return

		// Call the callback with setState and the new event data
		callback(setState, eventData!)
	}, [eventData, fetched, callback, channel, event])

	return [state, setState]
}
