import type { FoundryLocalDateTime } from '../types/foundry-local-date-time.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';

/**
 * Returns the local or UTC clock time of a date, truncated to the minute.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function toLocalDateTime(date: Date, options?: { readonly timeZone?: FoundryTimeZoneMode }): FoundryLocalDateTime {
  throw new Error('[foundry-utils]: not implemented');
}
