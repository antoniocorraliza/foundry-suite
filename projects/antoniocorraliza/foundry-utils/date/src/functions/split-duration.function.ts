import type { FoundryDuration } from '../interfaces/foundry-duration.interface';

/**
 * Splits a number of seconds into sign, hours, minutes and seconds, truncating decimals towards zero.
 * @throws {RangeError} When the number is not finite or is above `Number.MAX_SAFE_INTEGER`.
 */
export function splitDuration(totalSeconds: number): FoundryDuration {
  if (!Number.isFinite(totalSeconds) || Math.abs(totalSeconds) > Number.MAX_SAFE_INTEGER) {
    throw new RangeError(`[foundry-utils]: the seconds must be finite and at most Number.MAX_SAFE_INTEGER, got ${String(totalSeconds)}`);
  }
  const seconds: number = Math.abs(Math.trunc(totalSeconds));
  return {
    sign: Math.trunc(totalSeconds) < 0 ? -1 : 1,
    hours: Math.floor(seconds / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}
