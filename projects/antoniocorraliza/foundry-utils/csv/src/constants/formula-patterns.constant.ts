/** Start of a text that a spreadsheet would run as a formula: apostrophes, then `=`, `+`, `-`, `@`, a tab or a carriage return. */
export const FORMULA_START_PATTERN: RegExp = /^'*[=+\-@\t\r]/;
/** Start of a cell whose first apostrophe escapes a formula. */
export const ESCAPED_FORMULA_PATTERN: RegExp = /^'+[=+\-@\t\r]/;
/** Text that a spreadsheet reads as a number, with a dot or a comma, and that is never escaped. */
export const STRICT_NUMBER_PATTERN: RegExp = /^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/;
