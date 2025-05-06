import { SERVER_URL } from "../api/routes"

class LivekitService {
	private static token: string | null = null
	private 
	constructor() {

	}

	private async issueToken() {
		if(LivekitService.token) {
			return LivekitService.token
		}

		return await fetch(`${SERVER_URL}/centrifugo/token`).then(res => {
			if(!res.ok) {
				throw new Error("Failed to fetch token")
			}

			return res.json()
		})
	}
}
