import { TRANSLITERATED_LETTERS } from '../constants/slug-letters.constant';

/**
 * Writes a text as lower-case Latin words joined by hyphens, or `''` when it has no Latin letters.
 * @throws {TypeError} When the text is not a string.
 */
export function toSlug(text: string): string {
  if (typeof text !== 'string') throw new TypeError(`[foundry-utils]: the text of toSlug must be a string, got ${typeof text}`);
  return text
    .toLowerCase()
    .replace(/[\u0080-\u{10ffff}]/gu, (letter) => TRANSLITERATED_LETTERS[letter] ?? letter)
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/gu, '')
    .replace(/[\s-]+/gu, '-')
    .replace(/^-|-$/gu, '');
}
