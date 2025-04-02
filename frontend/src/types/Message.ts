export interface Message<T> {
	type: string
	contents: string | Resource<T>
}

export interface Resource<T> {
	eventName: string
	contents: T[]
}
