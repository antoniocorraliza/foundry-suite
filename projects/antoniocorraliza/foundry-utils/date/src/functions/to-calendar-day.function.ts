import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';

/**
 * Returns the local or UTC day of a date.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function toCalendarDay(date: Date, options?: { readonly timeZone?: FoundryTimeZoneMode }): FoundryCalendarDay {
  throw new Error('[foundry-utils]: not implemented');
}
