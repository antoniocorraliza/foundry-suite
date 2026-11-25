import type { FoundryBinaryInput } from '@antoniocorraliza/foundry-utils';
import type { HashAlgorithm } from '../types/hash-algorithm.type';

/**
 * Computes the digest of a text, encoded as UTF-8 without normalizing it, or of bytes, in lowercase hexadecimal.
 * Every error comes as a rejected promise.
 * @throws {TypeError} When the input is neither a text nor bytes, or a text needs `TextEncoder` and the environment lacks it.
 * @throws {FoundryCryptoUnavailableError} When `crypto` or `crypto.subtle` is missing.
 */
export function createHexDigest(algorithm: HashAlgorithm, input: string | FoundryBinaryInput): Promise<string> {
  throw new Error('[foundry-utils]: not implemented');
}
