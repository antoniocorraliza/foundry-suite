import type { FoundryCalendarDayParts } from '../interfaces/foundry-calendar-day-parts.interface';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';

/**
 * Returns the year, month, day and weekday of a calendar day.
 * @throws {RangeError} When the day is not canonical.
 */
export function getCalendarDayParts(day: FoundryCalendarDay): FoundryCalendarDayParts {
  throw new Error('[foundry-utils]: not implemented');
}
