import type { FoundryParseCalendarDayOptions } from '../interfaces/foundry-parse-calendar-day-options.interface';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';

/**
 * Converts unvalidated data into a canonical `'YYYY-MM-DD'` day, or returns `null`, without looking at the time zone.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function parseCalendarDay(value: unknown, options?: FoundryParseCalendarDayOptions): FoundryCalendarDay | null {
  throw new Error('[foundry-utils]: not implemented');
}
