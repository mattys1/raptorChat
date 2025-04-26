import { useEffect, useState } from "react"
import { useResourceFetcher } from "./useResourceFetcher"
import { useEventListener } from "./useEventListener"

export const useFetchAndListen = <T, U>(
	initial: T,
	endpoint: string,
	channel: string,
	event: string,
	callback: (setState: React.Dispatch<React.SetStateAction<T>>, incoming: U) => void,
	shouldFetch: boolean = true,
	shouldListen: boolean = true
): [T, React.Dispatch<React.SetStateAction<T>>] => {
	const [state, setState] = useState<T>(initial)
	const [fetched, setFetched] = useState(false)
	const [fetchedData, setFetchedData] = useResourceFetcher<T>(initial, endpoint)
	const [eventData, setEventData] =  useEventListener<U>(channel, event)	

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
		if (!fetched && eventData) return
		if (!shouldListen) return

		callback(setState, eventData!)
	}, [eventData, fetched, callback, channel, event, shouldListen])

	return [state, setState]
}
