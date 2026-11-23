import type { CivilDate } from '../interfaces/civil-date.interface';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { readCalendarDay } from './read-calendar-day.function';

/**
 * Returns the year, month and day of a canonical day.
 * @throws {RangeError} When the day is not canonical.
 */
export function getCivilDateOfCalendarDay(day: FoundryCalendarDay): CivilDate {
  const date: CivilDate | null = readCalendarDay(day);
  if (date === null) throw new RangeError(`[foundry-utils]: ${JSON.stringify(day)} is not a canonical YYYY-MM-DD day`);
  return date;
}
