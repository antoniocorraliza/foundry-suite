import type { FoundryTimePrecision } from '../types/foundry-time-precision.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';

/**
 * Writes the time of a date as `'HH:mm:ss'` by default, ending in `Z` in UTC.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function formatTime(
  date: Date,
  options?: { readonly precision?: Exclude<FoundryTimePrecision, 'none'>; readonly timeZone?: FoundryTimeZoneMode },
): string {
  throw new Error('[foundry-utils]: not implemented');
}
