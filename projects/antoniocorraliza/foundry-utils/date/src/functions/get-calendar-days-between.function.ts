import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { getEpochDayOfCalendarDay } from './get-epoch-day-of-calendar-day.function';

/**
 * Returns the days from `first` to `second`, positive when `second` is later.
 * @throws {RangeError} When a day is not canonical.
 */
export function getCalendarDaysBetween(first: FoundryCalendarDay, second: FoundryCalendarDay): number {
  return getEpochDayOfCalendarDay(second) - getEpochDayOfCalendarDay(first);
}
