import type { FoundryNumberFormatOptions } from '../interfaces/foundry-number-format-options.interface';
import { createNumberFormat } from './create-number-format.function';
import { writeNumber } from './write-number.function';

/**
 * Writes a number in a language, or returns `fallback` for `null`, `undefined`, `NaN` and infinities.
 * @throws {RangeError} When the language tag or the digits are not valid.
 * @throws {TypeError} When the value is not a number, or the options are not valid.
 */
export function formatNumber(value: number | null | undefined, options: FoundryNumberFormatOptions): string {
  return writeNumber(value, createNumberFormat(options, 'decimal'));
}
