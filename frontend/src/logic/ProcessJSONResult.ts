import { Result, ok, err } from "neverthrow"

export const SafeMarshall =  <T>(contents: T): Result<string, Error> =>  {
	try {
		return ok(JSON.stringify(contents))
	} catch(error) {
		return err(Error("Cannot marshall object to JSON: " + contents))
	}
}

export const SafeUnmarshall = <T>(contents: string): Result<T, Error> => {
	try {
		return ok(JSON.parse(contents) as T)
	} catch(error) {
		return err(Error("Couldn't unmarshall JSON: " + contents))
	}
}
