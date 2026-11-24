import type { FoundryParseDecimalOptions } from '../interfaces/foundry-parse-decimal-options.interface';

/**
 * Reads a decimal number written with the given separators, or returns `null` when the value is not such a number.
 * @throws {RangeError} When the group separator is the decimal separator.
 * @throws {TypeError} When the options are not valid.
 */
export function parseDecimal(value: unknown, options: FoundryParseDecimalOptions): number | null {
  throw new Error('[foundry-utils]: not implemented yet');
}
