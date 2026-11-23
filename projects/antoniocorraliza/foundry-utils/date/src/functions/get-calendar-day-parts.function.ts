import type { CivilDate } from '../interfaces/civil-date.interface';
import type { FoundryCalendarDayParts } from '../interfaces/foundry-calendar-day-parts.interface';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { getCivilDateOfCalendarDay } from './get-civil-date-of-calendar-day.function';
import { getWeekdayOfEpochDay } from './get-weekday-of-epoch-day.function';

/**
 * Returns the year, month, day and weekday of a calendar day.
 * @throws {RangeError} When the day is not canonical.
 */
export function getCalendarDayParts(day: FoundryCalendarDay): FoundryCalendarDayParts {
  const date: CivilDate = getCivilDateOfCalendarDay(day);
  return { year: date.year, month: date.month, day: date.day, weekday: getWeekdayOfEpochDay(convertCivilDateToEpochDay(date)) };
}
