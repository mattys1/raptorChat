import { CentrifugoService } from "../../logic/CentrifugoService"

export const usePresence = (channel: string) => {
	CentrifugoService.fetchPresence(channel).then((presence) => {
		console.log("Presence data:", presence)
	})
}
