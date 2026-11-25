/** Class of the characters that start a formula in a spreadsheet: `=`, `+`, `-`, `@`, a tab or a carriage return. */
export const FORMULA_CHARACTERS: string = '[=+\\-@\\t\\r]';
/** Start of a text that a spreadsheet would run as a formula: apostrophes, then one of `FORMULA_CHARACTERS`. */
export const FORMULA_START_PATTERN: RegExp = /* @__PURE__ */ new RegExp(`^'*${FORMULA_CHARACTERS}`);
/** Start of a cell whose first apostrophe escapes a formula. */
export const ESCAPED_FORMULA_PATTERN: RegExp = /* @__PURE__ */ new RegExp(`^'+${FORMULA_CHARACTERS}`);
/** Text that a spreadsheet reads as a number, with a dot or a comma, and that is never escaped. */
export const STRICT_NUMBER_PATTERN: RegExp = /^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/;
