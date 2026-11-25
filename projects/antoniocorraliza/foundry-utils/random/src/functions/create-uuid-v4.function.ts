/**
 * Returns a random version 4 UUID in lowercase, from `crypto.randomUUID`, or built with `crypto.getRandomValues` when it is missing.
 * @throws {FoundryCryptoUnavailableError} When `crypto` or `crypto.getRandomValues` is missing.
 */
export function createUuidV4(): string {
  throw new Error('[foundry-utils]: not implemented');
}
