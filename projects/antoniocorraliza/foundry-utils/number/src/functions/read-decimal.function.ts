import type { FoundryParseDecimalOptions } from '../interfaces/foundry-parse-decimal-options.interface';

/** Reads a decimal number written with separators that are already checked, or returns `null` when the value is not such a number. */
export function readDecimal(value: unknown, format: Required<FoundryParseDecimalOptions>): number | null {
  throw new Error('[foundry-utils]: not implemented yet');
}
