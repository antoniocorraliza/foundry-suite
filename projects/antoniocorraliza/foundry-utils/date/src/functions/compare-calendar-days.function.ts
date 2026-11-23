import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';

/**
 * Compares two calendar days, for `sort`.
 * @throws {RangeError} When a day is not canonical.
 */
export function compareCalendarDays(first: FoundryCalendarDay, second: FoundryCalendarDay): -1 | 0 | 1 {
  throw new Error('[foundry-utils]: not implemented');
}
