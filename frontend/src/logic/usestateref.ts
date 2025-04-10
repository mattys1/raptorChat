import { useState, useRef, useEffect } from 'react';

export interface StateRef<T> {
	setReference: (value: T | ((prevValue: T) => T)) => void;
	getReference: () => T;
	state: T;
}

export function useStateRef<T>(initialValue: T): StateRef<T> {
	const [state, setState] = useState<T>(initialValue);
	const reference = useRef<T>(initialValue);

	return {
		setReference: (value: T | ((prevValue: T) => T)) => {
			reference.current = value instanceof Function ?
				value(reference.current) : value;
			setState(value);
		},
		getReference: () => reference.current,

		state: state
	};
}
