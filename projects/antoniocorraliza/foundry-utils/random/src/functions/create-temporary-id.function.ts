/**
 * Returns a random negative integer, from -1 to -(2^53 - 1), for rows that are not saved yet. It is likely, not certain, to be unique.
 * @throws {FoundryCryptoUnavailableError} When `crypto` or `crypto.getRandomValues` is missing.
 */
export function createTemporaryId(): number {
  throw new Error('[foundry-utils]: not implemented');
}
