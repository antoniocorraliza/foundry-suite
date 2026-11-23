import type { FoundryWeekday } from '../types/foundry-weekday.type';

/**
 * Returns the days of the week of a date, starting on Monday by default, each at its first instant.
 * @throws {RangeError} When the date is invalid, an option is out of range or a day is skipped by the time zone.
 * @throws {TypeError} When the options are not an object.
 */
export function getCalendarWeek(date: Date, options?: { readonly firstDayOfWeek?: FoundryWeekday; readonly weeks?: number }): Array<Date> {
  throw new Error('[foundry-utils]: not implemented');
}
