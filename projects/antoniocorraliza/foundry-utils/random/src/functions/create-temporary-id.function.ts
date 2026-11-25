import { readRandomBytes } from './read-random-bytes.function';

/**
 * Returns a random negative integer, from -1 to -(2^53 - 1), for rows that are not saved yet. It is likely, not certain, to be unique.
 * @throws {FoundryCryptoUnavailableError} When `crypto` or `crypto.getRandomValues` is missing.
 */
export function createTemporaryId(): number {
  const value: number = readRandomBytes(7).reduce((total, byte, index) => total * 256 + (index === 0 ? byte & 0x1f : byte), 0);
  return value === 0 ? createTemporaryId() : -value;
}
