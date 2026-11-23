import type { FoundryIsoWeek } from '../interfaces/foundry-iso-week.interface';

/**
 * Returns the ISO 8601 week of the local day of a date, with the year it belongs to.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 */
export function getIsoWeek(date: Date): FoundryIsoWeek {
  throw new Error('[foundry-utils]: not implemented');
}
