/**
 * Returns a random code of `length` characters of the alphabet, all equally likely. Both are counted in code points.
 * @throws {RangeError} When the length is not an integer from 1 to 1024, or the alphabet does not have from 2 to 256 different characters.
 * @throws {TypeError} When the options or the alphabet are not valid.
 * @throws {FoundryCryptoUnavailableError} When `crypto` or `crypto.getRandomValues` is missing.
 */
export function createRandomCode(length: number, options?: { readonly alphabet?: string }): string {
  throw new Error('[foundry-utils]: not implemented');
}
