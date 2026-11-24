import type { FoundryRoundingMode } from '../types/foundry-rounding-mode.type';

/**
 * Rounds a number as it is written in decimal, not its binary value; ties go away from zero unless `mode` says otherwise.
 * @throws {RangeError} When `decimals` is not an integer from 0 to 20.
 * @throws {TypeError} When the value is not a number, or the options are not valid.
 */
export function roundToDecimals(value: number, decimals: number, options?: { readonly mode?: FoundryRoundingMode }): number {
  throw new Error('[foundry-utils]: not implemented yet');
}
