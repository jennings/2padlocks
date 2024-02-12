import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export function persistable<T>(
	storage: Storage,
	key: string,
	initialValue: T | null,
): Writable<T | null> {
	const initialStorage = storage.getItem(key);
	let savedValue = initialStorage ? deserialize(initialStorage) : initialValue;

	function deserialize(serialized: string): T {
		return JSON.parse(serialized);
	}

	const store = writable<T | null>(savedValue, (set) => {
		const ctrl = new AbortController();
		window.addEventListener(
			"storage",
			(e) => {
				if (e.storageArea === storage && e.key === key) {
					savedValue = e.newValue == null ? null : deserialize(e.newValue);
					set(savedValue);
				}
			},
			{ signal: ctrl.signal },
		);
		return () => ctrl.abort();
	});

	const set = (value: T | null) => {
		savedValue = value;
		store.set(value);
		storage.setItem(key, JSON.stringify(savedValue));
	};

	return {
		set,
		update(fn) {
			set(fn(savedValue));
		},
		subscribe: store.subscribe,
	};
}
