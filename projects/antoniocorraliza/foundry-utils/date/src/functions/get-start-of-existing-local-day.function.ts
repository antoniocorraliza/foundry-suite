import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { convertEpochDayToCalendarDay } from './convert-epoch-day-to-calendar-day.function';
import { findStartOfExistingDay } from './find-start-of-existing-day.function';

/**
 * Returns the first instant of a local day counted from 1970-01-01.
 * @throws {RangeError} When the day is outside 1-9999 or the local time zone skips the whole day.
 */
export function getStartOfExistingLocalDay(epochDay: number): Date {
  const day: FoundryCalendarDay = convertEpochDayToCalendarDay(epochDay);
  const start: Date | null = findStartOfExistingDay(epochDay, 'local');
  if (start === null) throw new RangeError(`[foundry-utils]: the local time zone skips the day ${day}`);
  return start;
}
