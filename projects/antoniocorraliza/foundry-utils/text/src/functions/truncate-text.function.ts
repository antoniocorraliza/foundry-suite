import { ɵcheckOptions, ɵparseTextOption } from '@antoniocorraliza/foundry-utils';
import { splitGraphemes } from './split-graphemes.function';

/**
 * Cuts a text to at most `maximumLength` visible characters, suffix included, without splitting a character.
 * @throws {RangeError} When `maximumLength` is not an integer of at least 0.
 * @throws {TypeError} When the text is not a string, or the options are not valid.
 */
export function truncateText(text: string, maximumLength: number, options?: { readonly suffix?: string }): string {
  if (typeof text !== 'string') throw new TypeError(`[foundry-utils]: the text of truncateText must be a string, got ${typeof text}`);
  if (!Number.isInteger(maximumLength) || maximumLength < 0) {
    throw new RangeError(
      `[foundry-utils]: the maximum length of truncateText must be an integer of at least 0, got ${String(maximumLength)}`,
    );
  }
  ɵcheckOptions(options, 'truncateText');
  const suffix: string = ɵparseTextOption({ options, name: 'suffix', fallback: '\u2026' });
  const graphemes: Array<string> = splitGraphemes(text);
  if (graphemes.length <= maximumLength) return text;
  const suffixLength: number = splitGraphemes(suffix).length;
  if (maximumLength <= suffixLength) return graphemes.slice(0, maximumLength).join('');
  return `${graphemes.slice(0, maximumLength - suffixLength).join('')}${suffix}`;
}
