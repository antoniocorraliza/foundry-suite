import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { getEpochDay } from './get-epoch-day.function';

/**
 * Compares two calendar days, for `sort`.
 * @throws {RangeError} When a day is not canonical.
 */
export function compareCalendarDays(first: FoundryCalendarDay, second: FoundryCalendarDay): -1 | 0 | 1 {
  return Math.sign(getEpochDay(first) - getEpochDay(second)) as -1 | 0 | 1;
}
