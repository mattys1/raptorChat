import { Result, ok, err } from "neverthrow";

export class WebsocketService {
	private static socket: Result<WebSocket, Error>
	private constructor() {}

	public static getInstance(): Result<WebSocket, Error> {
		if(!this.socket) {
			try {
				this.socket = ok(new WebSocket("ws://localhost:8080/ws"))	
			} catch(error) {
				this.socket = err(Error("Failed to create WebSocket instance."))
			}
		}

		return this.socket
	}
}
