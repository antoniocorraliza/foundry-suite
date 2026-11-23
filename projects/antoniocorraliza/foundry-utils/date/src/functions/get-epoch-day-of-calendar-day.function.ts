import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { getCivilDateOfCalendarDay } from './get-civil-date-of-calendar-day.function';

/**
 * Returns the days from 1970-01-01 to a canonical day.
 * @throws {RangeError} When the day is not canonical.
 */
export function getEpochDayOfCalendarDay(day: FoundryCalendarDay): number {
  return convertCivilDateToEpochDay(getCivilDateOfCalendarDay(day));
}
