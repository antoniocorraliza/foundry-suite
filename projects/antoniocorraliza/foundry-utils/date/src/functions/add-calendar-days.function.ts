import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';

/**
 * Adds calendar days to a day, negative numbers subtract.
 * @throws {RangeError} When the day is not canonical, `days` is not an integer or the result is outside 0001-9999.
 */
export function addCalendarDays(day: FoundryCalendarDay, days: number): FoundryCalendarDay {
  throw new Error('[foundry-utils]: not implemented');
}
