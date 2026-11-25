import { ɵisOptionsValue, ɵparseLanguageTag, ɵparseTextOption } from '@antoniocorraliza/foundry-utils';
import { TITLE_CASE_WORD } from '../constants/title-case-word.constant';

/**
 * Writes each word with its first letter in upper case and the rest in lower case, with the rules of `locale` when it is given.
 * @throws {RangeError} When the language tag is invalid.
 * @throws {TypeError} When the text is not a string, or the options are not valid.
 */
export function toTitleCase(text: string, options?: { readonly locale?: string }): string {
  if (typeof text !== 'string') throw new TypeError(`[foundry-utils]: the text of toTitleCase must be a string, got ${typeof text}`);
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of toTitleCase must be an object');
  const locale: string | null = ɵparseTextOption({ options, name: 'locale', fallback: null });
  const languageTag: string | null = locale === null ? null : ɵparseLanguageTag(locale);
  return text.replace(TITLE_CASE_WORD, (word) => capitalizeWord(word, languageTag));
}

function capitalizeWord(word: string, locale: string | null): string {
  const firstCharacter: string = String.fromCodePoint(word.codePointAt(0) ?? 0);
  const rest: string = word.slice(firstCharacter.length);
  if (locale === null) return `${firstCharacter.toUpperCase()}${rest.toLowerCase()}`;
  return `${firstCharacter.toLocaleUpperCase(locale)}${rest.toLocaleLowerCase(locale)}`;
}
