import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { compareEpochDays } from './compare-epoch-days.function';
import { getEpochDayOfCalendarDay } from './get-epoch-day-of-calendar-day.function';

/**
 * Compares two calendar days, for `sort`.
 * @throws {RangeError} When a day is not canonical.
 */
export function compareCalendarDays(first: FoundryCalendarDay, second: FoundryCalendarDay): -1 | 0 | 1 {
  return compareEpochDays(getEpochDayOfCalendarDay(first), getEpochDayOfCalendarDay(second));
}
