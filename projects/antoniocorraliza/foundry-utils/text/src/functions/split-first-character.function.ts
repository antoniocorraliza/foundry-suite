/** Splits a text into its first character, a whole code point, and the rest; both are `''` for an empty text. */
export function splitFirstCharacter(text: string): [string, string] {
  const firstCodePoint: number | undefined = text.codePointAt(0);
  if (firstCodePoint === undefined) return ['', ''];
  const firstCharacter: string = String.fromCodePoint(firstCodePoint);
  return [firstCharacter, text.slice(firstCharacter.length)];
}
