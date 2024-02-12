import type { StringKeyPair } from "./encryption";

export type SecretRequest = {
	name: string;
	created_at: string;
	keyPair: StringKeyPair;
};
