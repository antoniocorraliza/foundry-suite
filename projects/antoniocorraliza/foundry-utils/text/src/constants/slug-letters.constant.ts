/** Latin letters without a base letter and a mark, and the letters that a slug writes for each one. */
export const TRANSLITERATED_LETTERS: Readonly<Record<string, string>> = {
  '\u00df': 'ss',
  '\u00e6': 'ae',
  '\u0153': 'oe',
  '\u00f8': 'o',
  '\u0142': 'l',
  '\u0111': 'd',
};

/** Letters of `TRANSLITERATED_LETTERS`, as a regular expression. */
export const TRANSLITERATED_LETTER_PATTERN: RegExp = /[\u00df\u00e6\u0153\u00f8\u0142\u0111]/gu;
