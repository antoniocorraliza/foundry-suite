import { getEpochDayOfDate } from './get-epoch-day-of-date.function';

/**
 * Compares the local days of two dates, for `sort`.
 * @throws {RangeError} When a date is invalid or outside 1-9999.
 */
export function compareDays(first: Date, second: Date): -1 | 0 | 1 {
  const difference: number = getEpochDayOfDate(first) - getEpochDayOfDate(second);
  if (difference === 0) return 0;
  return difference < 0 ? -1 : 1;
}
