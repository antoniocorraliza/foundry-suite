import { readDateTime } from './read-date-time.function';

/**
 * Returns the time of a valid `Date` of any context.
 * @throws {RangeError} When the value is not a valid date.
 */
export function getValidTime(date: Date): number {
  const time: number | null = readDateTime(date);
  if (time === null || Number.isNaN(time)) throw new RangeError('[foundry-utils]: the date is invalid');
  return time;
}
