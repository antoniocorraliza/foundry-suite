import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { getStartOfLocalDay } from './get-start-of-local-day.function';
import { getZonedParts } from './get-zoned-parts.function';
/**
 * Returns the last instant of the local day of a date.
 * @throws {RangeError} When the date is invalid or the result is outside 1-9999.
 */
export function endOfDay(date: Date): Date {
  return new Date(getStartOfLocalDay(convertCivilDateToEpochDay(getZonedParts(date, 'local')) + 1).getTime() - 1);
}
