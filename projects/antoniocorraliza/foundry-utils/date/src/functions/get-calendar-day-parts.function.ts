import type { FoundryCalendarDayParts } from '../interfaces/foundry-calendar-day-parts.interface';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { getEpochDay } from './get-epoch-day.function';
import { getWeekdayOfEpochDay } from './get-weekday-of-epoch-day.function';

/**
 * Returns the year, month, day and weekday of a calendar day.
 * @throws {RangeError} When the day is not canonical.
 */
export function getCalendarDayParts(day: FoundryCalendarDay): FoundryCalendarDayParts {
  const epochDay: number = getEpochDay(day);
  return {
    year: Number(day.slice(0, 4)),
    month: Number(day.slice(5, 7)),
    day: Number(day.slice(8, 10)),
    weekday: getWeekdayOfEpochDay(epochDay),
  };
}
