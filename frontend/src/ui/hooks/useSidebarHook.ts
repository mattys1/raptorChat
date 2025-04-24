import { useEffect, useState } from "react"
import { SubscriptionManager } from "../../logic/SubscriptionManager"
import { MessageEvents } from "../../structs/MessageNames"
import { Room } from "../../structs/models/Models"
import { useWebsocketListener } from "./useWebsocketListener"
import { Centrifuge } from "centrifuge"
import { SERVER_URL } from "../../api/routes"
//
export const useSidebarHook = () => {
	const [rooms, setRooms] = useState<Room[]>([])

	useEffect(() => {
		console.log("Fetching rooms...")
		fetch(SERVER_URL + "/api/user/me/rooms", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		})
			.then((response) => response.json())
			.then((data) => {
				console.log("Fetched rooms:", data)
				setRooms(data)
			})
			.catch((error) => {
				console.error("Error fetching rooms:", error)
			})
	}, [])

	return {
		rooms,
		setRooms,
	}
}
