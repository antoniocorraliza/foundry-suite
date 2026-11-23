import type { FoundryIsoWeek } from '../interfaces/foundry-iso-week.interface';
import { getEpochDayOfDate } from './get-epoch-day-of-date.function';
import { getIsoWeekOfEpochDay } from './get-iso-week-of-epoch-day.function';

/**
 * Returns the ISO 8601 week of the local day of a date, with the year it belongs to.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 */
export function getIsoWeek(date: Date): FoundryIsoWeek {
  return getIsoWeekOfEpochDay(getEpochDayOfDate(date));
}
