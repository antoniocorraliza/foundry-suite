import { getEpochDayOfDate } from './get-epoch-day-of-date.function';
import { getStartOfLocalDay } from './get-start-of-local-day.function';

/**
 * Returns the first instant of the local day of a date.
 * @throws {RangeError} When the date is invalid or the result is outside 1-9999.
 */
export function startOfDay(date: Date): Date {
  return getStartOfLocalDay(getEpochDayOfDate(date));
}
