import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { convertEpochDayToCalendarDay } from './convert-epoch-day-to-calendar-day.function';
import { getEpochDay } from './get-epoch-day.function';

/**
 * Adds calendar days to a day, negative numbers subtract.
 * @throws {RangeError} When the day is not canonical, `days` is not an integer or the result is outside 1-9999.
 */
export function addCalendarDays(day: FoundryCalendarDay, days: number): FoundryCalendarDay {
  const epochDay: number = getEpochDay(day);
  if (!Number.isInteger(days)) throw new RangeError(`[foundry-utils]: the days to add must be an integer, got ${String(days)}`);
  return convertEpochDayToCalendarDay(epochDay + days);
}
