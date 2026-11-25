import { splitFirstCharacter } from './split-first-character.function';

/**
 * Writes the first character of a text in upper case and leaves the rest as it is.
 * @throws {TypeError} When the text is not a string.
 */
export function capitalizeFirstLetter(text: string): string {
  if (typeof text !== 'string') {
    throw new TypeError(`[foundry-utils]: the text of capitalizeFirstLetter must be a string, got ${typeof text}`);
  }
  const [firstCharacter, rest]: [string, string] = splitFirstCharacter(text);
  return `${firstCharacter.toUpperCase()}${rest}`;
}
