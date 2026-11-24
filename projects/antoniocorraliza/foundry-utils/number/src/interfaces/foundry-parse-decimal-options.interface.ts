/** How `parseDecimal` reads a decimal number written as text. */
export interface FoundryParseDecimalOptions {
  /** Separator between the integer and the decimal part. */
  readonly decimalSeparator: '.' | ',';
  /** Group separator that the text may use; none by default. `' '` takes any space that numbers use, and `"'"` both apostrophes. */
  readonly groupSeparator?: '.' | ',' | ' ' | "'" | null;
  /** Size of the groups: `'thousands'` (by default) or `'indian'` (the last group of 3, the others of 2). */
  readonly groupStyle?: 'thousands' | 'indian';
}
