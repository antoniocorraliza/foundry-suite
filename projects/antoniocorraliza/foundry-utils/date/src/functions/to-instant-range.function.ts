import type { FoundryCalendarDayRange } from '../interfaces/foundry-calendar-day-range.interface';
import type { FoundryInstantRange } from '../interfaces/foundry-instant-range.interface';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';

/**
 * Returns the half-open range of instants of a day or a range of days, without gaps or overlaps.
 * @throws {RangeError} When a day is not canonical or the range starts after it ends.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function toInstantRange(
  days: FoundryCalendarDay | FoundryCalendarDayRange,
  options?: { readonly timeZone?: FoundryTimeZoneMode },
): FoundryInstantRange {
  throw new Error('[foundry-utils]: not implemented');
}
