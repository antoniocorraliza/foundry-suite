import type { FoundryBinaryInput } from '@antoniocorraliza/foundry-utils';

/**
 * Computes the SHA-512 of a text, encoded as UTF-8 without normalizing it, or of bytes, in lowercase hexadecimal.
 * Every error comes as a rejected promise.
 * @throws {TypeError} When the input is neither a text nor bytes.
 * @throws {FoundryCryptoUnavailableError} When `crypto` or `crypto.subtle` is missing.
 */
export function sha512(input: string | FoundryBinaryInput): Promise<string> {
  throw new Error('[foundry-utils]: not implemented');
}
