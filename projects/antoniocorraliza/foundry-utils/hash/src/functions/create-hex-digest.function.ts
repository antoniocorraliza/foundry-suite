import type { FoundryBinaryInput } from '@antoniocorraliza/foundry-utils';
import { FoundryCryptoUnavailableError, ɵgetValueKind } from '@antoniocorraliza/foundry-utils';
import type { HashAlgorithm } from '../types/hash-algorithm.type';

function readInputBytes(input: string | FoundryBinaryInput): Uint8Array<ArrayBuffer> {
  if (typeof input === 'string') {
    if (typeof TextEncoder === 'undefined') {
      throw new TypeError('[foundry-utils]: a text needs TextEncoder, which is not available in this environment');
    }
    return new TextEncoder().encode(input);
  }
  if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength) as Uint8Array<ArrayBuffer>;
  return new Uint8Array(input);
}

/**
 * Computes the digest of a text, encoded as UTF-8 without normalizing it, or of bytes, in lowercase hexadecimal.
 * Every error comes as a rejected promise.
 * @throws {TypeError} When the input is neither a text nor bytes, or a text needs `TextEncoder` and the environment lacks it.
 * @throws {FoundryCryptoUnavailableError} When `crypto` or `crypto.subtle` is missing.
 */
export async function createHexDigest(algorithm: HashAlgorithm, input: string | FoundryBinaryInput): Promise<string> {
  if (typeof input !== 'string' && ɵgetValueKind(input) !== 'arrayBuffer' && !ArrayBuffer.isView(input)) {
    throw new TypeError(`[foundry-utils]: the input of ${algorithm} must be a string, an ArrayBuffer or a view of one`);
  }
  if (typeof crypto === 'undefined') throw new FoundryCryptoUnavailableError({ missingApi: 'crypto' });
  if (typeof crypto.subtle === 'undefined') throw new FoundryCryptoUnavailableError({ missingApi: 'crypto.subtle' });
  const digest: ArrayBuffer = await crypto.subtle.digest(algorithm, readInputBytes(input));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
