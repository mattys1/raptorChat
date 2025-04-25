export interface EventResource<T> {
	channel: string
	method: "POST" | "GET" | "PUT" | "DELETE" | "PATCH"
	event_name: string
	contents: T | T[]
}
