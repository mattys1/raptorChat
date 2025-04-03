export interface Message<T = unknown> {
	type: string
	contents: Subscription | Resource<T>
}

export interface Resource<T> {
	eventName: string
	contents: Array<T>
}

export interface Subscription {
	eventName: string
	targetIds: number[]
}
