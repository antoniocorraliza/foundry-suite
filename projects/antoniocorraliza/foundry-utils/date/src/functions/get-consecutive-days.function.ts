import { buildLocalDays } from './build-local-days.function';
import { getEpochDayOfDate } from './get-epoch-day-of-date.function';

/**
 * Returns `count` local days from the day of `start`, each at its first instant.
 * @throws {RangeError} When the date is invalid, `count` is not an integer from 0 to 36600 or a day is skipped by the time zone.
 */
export function getConsecutiveDays(start: Date, count: number): Array<Date> {
  const startEpochDay: number = getEpochDayOfDate(start);
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`[foundry-utils]: the count must be an integer of at least 0, got ${String(count)}`);
  }
  return buildLocalDays(startEpochDay, count, 1);
}
