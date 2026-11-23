import { getEpochDayOfDate } from './get-epoch-day-of-date.function';

/**
 * Tells whether two dates fall on the same local day.
 * @throws {RangeError} When a date is invalid or outside 1-9999.
 */
export function isSameDay(first: Date, second: Date): boolean {
  return getEpochDayOfDate(first) === getEpochDayOfDate(second);
}
