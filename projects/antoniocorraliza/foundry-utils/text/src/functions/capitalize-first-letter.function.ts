/**
 * Writes the first character of a text in upper case and leaves the rest as it is.
 * @throws {TypeError} When the text is not a string.
 */
export function capitalizeFirstLetter(text: string): string {
  if (typeof text !== 'string') {
    throw new TypeError(`[foundry-utils]: the text of capitalizeFirstLetter must be a string, got ${typeof text}`);
  }
  const firstCodePoint: number | undefined = text.codePointAt(0);
  if (firstCodePoint === undefined) return text;
  const firstCharacter: string = String.fromCodePoint(firstCodePoint);
  return `${firstCharacter.toUpperCase()}${text.slice(firstCharacter.length)}`;
}
