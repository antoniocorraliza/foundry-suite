import { ɵisOptionsValue, ɵparseTextOption } from '@antoniocorraliza/foundry-utils';
import {
  DEFAULT_RANDOM_CODE_ALPHABET,
  MAX_ALPHABET_SIZE,
  MAX_RANDOM_CODE_LENGTH,
  MIN_ALPHABET_SIZE,
} from '../constants/random-code-settings.constant';
import { readRandomBytes } from './read-random-bytes.function';

function splitAlphabet(text: string): Array<string> {
  const characters: Array<string> = Array.from(text);
  if (characters.length < MIN_ALPHABET_SIZE || characters.length > MAX_ALPHABET_SIZE || new Set(characters).size !== characters.length) {
    throw new RangeError(
      `[foundry-utils]: the alphabet of createRandomCode must have from ${MIN_ALPHABET_SIZE} to ${MAX_ALPHABET_SIZE} different characters`,
    );
  }
  return characters;
}

/**
 * Returns a random code of `length` characters of the alphabet, all equally likely. Both are counted in code points.
 * @throws {RangeError} When the length is not an integer from 1 to 1024, or the alphabet does not have from 2 to 256 different characters.
 * @throws {TypeError} When the options or the alphabet are not valid.
 * @throws {FoundryCryptoUnavailableError} When `crypto` or `crypto.getRandomValues` is missing.
 */
export function createRandomCode(length: number, options?: { readonly alphabet?: string }): string {
  if (!Number.isInteger(length) || length < 1 || length > MAX_RANDOM_CODE_LENGTH) {
    throw new RangeError(
      `[foundry-utils]: the length of createRandomCode must be an integer from 1 to ${MAX_RANDOM_CODE_LENGTH}, got ${String(length)}`,
    );
  }
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of createRandomCode must be an object');
  const alphabet: Array<string> = splitAlphabet(ɵparseTextOption({ options, name: 'alphabet', fallback: DEFAULT_RANDOM_CODE_ALPHABET }));
  const keptBytes: number = MAX_ALPHABET_SIZE - (MAX_ALPHABET_SIZE % alphabet.length);
  const characters: Array<string> = [];
  while (characters.length < length) {
    readRandomBytes(length - characters.length).forEach((byte) => {
      if (byte < keptBytes) characters.push(alphabet[byte % alphabet.length] ?? '');
    });
  }
  return characters.join('');
}
