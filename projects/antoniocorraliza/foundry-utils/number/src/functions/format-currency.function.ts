import type { FoundryCurrencyFormatOptions } from '../interfaces/foundry-currency-format-options.interface';

/**
 * Writes an amount in a currency and a language, or returns `fallback` for `null`, `undefined`, `NaN` and infinities.
 * @throws {RangeError} When the language tag, the currency or the digits are not valid.
 * @throws {TypeError} When the amount is not a number, or the options are not valid.
 */
export function formatCurrency(amount: number | null | undefined, options: FoundryCurrencyFormatOptions): string {
  throw new Error('[foundry-utils]: not implemented yet');
}
