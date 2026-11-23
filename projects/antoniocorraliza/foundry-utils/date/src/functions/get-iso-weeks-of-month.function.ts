import type { FoundryIsoWeek } from '../interfaces/foundry-iso-week.interface';

/**
 * Returns the ISO 8601 weeks of the days of the local month of a date, in order.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 */
export function getIsoWeeksOfMonth(date: Date): Array<FoundryIsoWeek> {
  throw new Error('[foundry-utils]: not implemented');
}
