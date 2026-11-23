import type { FoundryWeekday } from '../types/foundry-weekday.type';

/**
 * Returns the 42 days of the month grid of a date, starting on Monday by default.
 * @throws {RangeError} When the date is invalid, `firstDayOfWeek` is out of range or a day is skipped by the time zone.
 * @throws {TypeError} When the options are not an object.
 */
export function getCalendarMonthGrid(date: Date, options?: { readonly firstDayOfWeek?: FoundryWeekday }): Array<Date> {
  throw new Error('[foundry-utils]: not implemented');
}
