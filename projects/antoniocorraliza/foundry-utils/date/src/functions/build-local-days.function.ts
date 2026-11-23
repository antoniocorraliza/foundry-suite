import { MAX_LISTED_DAYS } from '../constants/date-limits.constant';
import { getStartOfExistingLocalDay } from './get-start-of-existing-local-day.function';

/**
 * Returns `count` local days, `step` days apart from the first one, each built from its parts at its first instant.
 * @throws {RangeError} When the list passes 36600 days, a day is outside 1-9999 or the time zone skips a day.
 */
export function buildLocalDays(firstEpochDay: number, count: number, step: number): Array<Date> {
  if (count > MAX_LISTED_DAYS) {
    throw new RangeError(`[foundry-utils]: a list of days has at most ${MAX_LISTED_DAYS} days, ${count} requested`);
  }
  return Array.from({ length: count }, (_entry, index) => getStartOfExistingLocalDay(firstEpochDay + index * step));
}
