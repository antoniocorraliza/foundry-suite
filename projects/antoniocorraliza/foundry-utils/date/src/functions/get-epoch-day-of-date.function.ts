import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { getZonedParts } from './get-zoned-parts.function';

/**
 * Returns the days from 1970-01-01 to the local day of a date.
 * @throws {RangeError} When the date is invalid or its local year is outside 1-9999.
 */
export function getEpochDayOfDate(date: Date): number {
  return convertCivilDateToEpochDay(getZonedParts(date, 'local'));
}
