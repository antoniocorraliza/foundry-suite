import type { FoundryParseDecimalOptions } from '../interfaces/foundry-parse-decimal-options.interface';
/** Marks of text direction that some languages write before a number. */
export const LEADING_DIRECTION_MARKS: RegExp = /^[\u200e\u200f\u061c]+/u;
/** Number that `getParseDecimalOptions` writes to find the separators of a language: seven integer digits and a decimal. */
export const SEPARATOR_SAMPLE: number = 1234567.5;
/** Characters that each separator of `parseDecimal` takes, as a regular expression. */
export const SEPARATOR_PATTERNS: Readonly<Record<NonNullable<FoundryParseDecimalOptions['groupSeparator']>, string>> = {
  '.': '\\.',
  ',': ',',
  ' ': '[ \\u00a0\\u202f\\u2009]',
  "'": "['\\u2019]",
};
/** Group separator of `parseDecimal` for each character that `Intl` writes between groups. */
export const GROUP_SEPARATORS_BY_CHARACTER: Readonly<Record<string, NonNullable<FoundryParseDecimalOptions['groupSeparator']>>> = {
  '.': '.',
  ',': ',',
  ' ': ' ',
  '\u00a0': ' ',
  '\u202f': ' ',
  '\u2009': ' ',
  "'": "'",
  '\u2019': "'",
};
