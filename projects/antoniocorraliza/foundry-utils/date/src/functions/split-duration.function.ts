import type { FoundryDuration } from '../interfaces/foundry-duration.interface';

/**
 * Splits a number of seconds into sign, hours, minutes and seconds, truncating decimals towards zero.
 * @throws {RangeError} When the number is not finite or is above `Number.MAX_SAFE_INTEGER`.
 */
export function splitDuration(totalSeconds: number): FoundryDuration {
  throw new Error('[foundry-utils]: not implemented');
}
