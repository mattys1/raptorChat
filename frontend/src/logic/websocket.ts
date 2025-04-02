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

	private static async waitForOpen(): Promise<Result<void, Error>> {
		const socketResult = this.getInstance();

		if (socketResult.isErr()) {
			return err(socketResult.error); 		
		}

		const socket = socketResult.value;

		return new Promise<Result<void, Error>>(resolve => {
			const onOpen = () => {
				clearTimeout(timer);
				resolve(ok());
			};

			const timeoutMs = 5000;

			const timer = setTimeout(() => {
				socket.removeEventListener('open', onOpen);
				resolve(err(new Error("WebSocket connection timeout")));
			}, timeoutMs);

			if (socket.readyState === WebSocket.OPEN) {
				clearTimeout(timer);
				resolve(ok());
			} else {
				socket.addEventListener('open', onOpen);
			}
		});
	}

	public static async safeSend(data: string): Promise<Result<void, Error>> {
		const socketResult = this.getInstance();
		if(socketResult.isErr()) {
			return err(socketResult.error);
		}

		const openResult = await this.waitForOpen();
		if(openResult.isErr()) {
			return openResult;
		}

		try {
			console.log("Sending data through websocket:", data)
			socketResult.value.send(data);
			return ok();
		} catch(error) {
			return err(Error("Couldn't send data through socket"));
		}
	}
}
