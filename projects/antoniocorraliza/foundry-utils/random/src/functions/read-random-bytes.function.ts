import { FoundryCryptoUnavailableError } from '@antoniocorraliza/foundry-utils';

/**
 * Reads `length` random bytes from `crypto.getRandomValues`.
 * @throws {FoundryCryptoUnavailableError} When `crypto` or `crypto.getRandomValues` is missing.
 */
export function readRandomBytes(length: number): Uint8Array {
  if (typeof crypto === 'undefined') throw new FoundryCryptoUnavailableError({ missingApi: 'crypto' });
  if (typeof crypto.getRandomValues !== 'function') throw new FoundryCryptoUnavailableError({ missingApi: 'crypto.getRandomValues' });
  return crypto.getRandomValues(new Uint8Array(length));
}
