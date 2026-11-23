import { compareEpochDays } from './compare-epoch-days.function';
import { getEpochDayOfDate } from './get-epoch-day-of-date.function';

/**
 * Compares the local days of two dates, for `sort`.
 * @throws {RangeError} When a date is invalid or outside 1-9999.
 */
export function compareDays(first: Date, second: Date): -1 | 0 | 1 {
  return compareEpochDays(getEpochDayOfDate(first), getEpochDayOfDate(second));
}
