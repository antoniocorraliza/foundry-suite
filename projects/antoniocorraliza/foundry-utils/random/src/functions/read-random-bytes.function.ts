/**
 * Reads `length` random bytes from `crypto.getRandomValues`.
 * @throws {FoundryCryptoUnavailableError} When `crypto` or `crypto.getRandomValues` is missing.
 */
export function readRandomBytes(length: number): Uint8Array {
  throw new Error('[foundry-utils]: not implemented');
}
