import { useEffect, useState } from "react"
import { SubscriptionManager } from "../../logic/SubscriptionManager"
import { MessageEvents } from "../../structs/MessageNames"
import { Room } from "../../structs/models/Models"
import { useWebsocketListener } from "./useWebsocketListener"
import { Centrifuge } from "centrifuge"
import { SERVER_URL } from "../../api/routes"
import { useResourceFetcher } from "../../logic/useResourceFetcher"
//
export const useSidebarHook = () => {
	const [rooms, setRooms] = useResourceFetcher<Room[]>(SERVER_URL + "/api/user/me/rooms", [])

	return {
		rooms,
		setRooms,
	}
}
