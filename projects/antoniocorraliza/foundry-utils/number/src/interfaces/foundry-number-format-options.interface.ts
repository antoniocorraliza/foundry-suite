/** How `formatNumber` writes a number. */
export interface FoundryNumberFormatOptions {
  /** Language tag of the text. */
  readonly locale: string;
  /** Fewest decimal digits to write. */
  readonly minimumFractionDigits?: number;
  /** Most decimal digits to write. */
  readonly maximumFractionDigits?: number;
  /** When to write group separators; `'locale'` by default, as the language does. */
  readonly grouping?: 'locale' | 'always' | 'never';
  /** Text returned for `null`, `undefined`, `NaN` and infinities; `''` by default. */
  readonly fallback?: string;
}
