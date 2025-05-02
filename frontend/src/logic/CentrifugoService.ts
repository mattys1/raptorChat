import { Centrifuge, Subscription } from "centrifuge";
import { createSessionStorage } from "react-router-dom";

export class CentrifugoService {
	private static instance: Centrifuge | null = null
	private static tokenName = "centrifugoToken"
	private static subs = new Map<string, {sub: Subscription; count: number}>()

	private static async getInstance(): Promise<Centrifuge> {
		if(CentrifugoService.instance) {
			return CentrifugoService.instance
		}

		CentrifugoService.instance = new Centrifuge("ws://localhost:8000/connection/websocket", {
			token: localStorage.getItem(this.tokenName) || "",
			debug: true,
		})

		const connectionPromise = new Promise<Centrifuge>((resolve, reject) => {
			CentrifugoService.instance!.on("connected", (ctx) => {
				console.log("Connected to Centrifuge", ctx)
				resolve(CentrifugoService.instance!)
			})

			CentrifugoService.instance!.on("error", (ctx) => {
				reject(new Error(`Connection failed: ${ctx.error}`))
			})

			setTimeout(() => reject(new Error("Connection timeout")), 10000)
		})

		CentrifugoService.instance.connect()
		return connectionPromise
	}

	public static async subscribe(channel: string): Promise<Subscription> {
		const instance = await this.getInstance()
		console.log("Calling subscribe service on channel", channel)
		if(this.subs.has(channel)) {
			let subscribed = this.subs.get(channel)!
			subscribed.count++
			return this.subs.get(channel)!.sub
		}

		const sub = (() => {
			try {
				const newSub = instance.newSubscription(channel);
				this.subs.set(channel, {sub: newSub, count: 1})

				return newSub
			} catch (e) {
				console.warn("Subscription exists on server but not on client:", e);
				const remoteSub = instance.getSubscription(channel)!
				this.subs.set(channel, {sub: remoteSub, count: 1})
				return remoteSub
			}
		})();

		sub.on('error', (ctx) => {
			console.error(`Error on channel ${channel}:`, ctx);
		})
		sub.on('state', (ctx => {
			console.log(`State changed on channel ${channel}:`, ctx);
		}))
		sub.subscribe()

		return sub
	}

	public static async unsubscribe(channel: string) {
		console.log("Unsubscribing from channel", channel)
		if(this.subs.has(channel)) {
			let subscribed = this.subs.get(channel)!
			subscribed.count--
		} else {
			console.error(`Tried to unsubscribe from channel ${channel} but it was not subscribed`)
		}

		if(this.subs.get(channel)!.count <= 0) {
			const subRecord = this.subs.get(channel)!
			subRecord.sub.unsubscribe()
			this.subs.delete(channel)
		}

	}

	public static async fetchPresence(channel: string) {
		const instance = await this.getInstance()
		return instance.presence(channel).then((presence) => {
			console.log(presence.clients)
			return presence.clients
		}) 
	}

	public static async disconnect() {
		if(this.instance) {
			this.instance.disconnect()
			this.instance = null
		}
		this.subs.clear()
		console.log("Disconnected from Centrifuge")
	}
}
