import type { StringKeyPair } from "./encryption";

export type SecretRequest = {
	name: string;
	created_at: string;
	keyPair: StringKeyPair;
};

export function secretRequestEquals(a: SecretRequest, b: SecretRequest) {
	return a.keyPair.privateKey == b.keyPair.privateKey;
}
