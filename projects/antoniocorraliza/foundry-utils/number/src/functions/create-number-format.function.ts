import type { NumberWriter } from '../interfaces/number-writer.interface';
import type { NumberFormatStyle } from '../types/number-format-style.type';

/**
 * Reads the options of a formatting function and creates its `Intl.NumberFormat`.
 * @throws {RangeError} When the language tag, the currency or the digits are not valid.
 * @throws {TypeError} When the options are not valid.
 */
export function createNumberFormat(options: unknown, style: NumberFormatStyle): NumberWriter {
  throw new Error('[foundry-utils]: not implemented yet');
}
