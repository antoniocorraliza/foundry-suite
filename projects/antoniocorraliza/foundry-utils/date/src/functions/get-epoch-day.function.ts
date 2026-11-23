import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { convertCalendarDayToEpochDay } from './convert-calendar-day-to-epoch-day.function';

/**
 * Returns the days from 1970-01-01 to a canonical day.
 * @throws {RangeError} When the day is not canonical.
 */
export function getEpochDay(day: FoundryCalendarDay): number {
  const epochDay: number | null = convertCalendarDayToEpochDay(day);
  if (epochDay === null) throw new RangeError(`[foundry-utils]: ${JSON.stringify(day)} is not a canonical YYYY-MM-DD day`);
  return epochDay;
}
