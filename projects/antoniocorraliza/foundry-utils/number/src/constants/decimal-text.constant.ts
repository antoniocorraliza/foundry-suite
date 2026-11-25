/** Marks of text direction that some languages write before a number. */
export const LEADING_DIRECTION_MARKS: RegExp = /^[\u200e\u200f\u061c]+/u;
/** Number that `getParseDecimalOptions` writes to find the separators of a language: seven integer digits and a decimal. */
export const SEPARATOR_SAMPLE: number = 1234567.5;
/** Spaces that `parseDecimal` reads as the group separator `' '`. */
export const SPACE_GROUP_CHARACTERS: ReadonlyArray<string> = [' ', '\u00a0', '\u202f', '\u2009'];
/** Apostrophes that `parseDecimal` reads as the group separator `"'"`. */
export const APOSTROPHE_GROUP_CHARACTERS: ReadonlyArray<string> = ["'", '\u2019'];
