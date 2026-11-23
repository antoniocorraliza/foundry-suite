import type { FoundryIsoWeek } from '../interfaces/foundry-iso-week.interface';
import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { convertEpochDayToCivilDate } from './convert-epoch-day-to-civil-date.function';
import { getWeekdayOfEpochDay } from './get-weekday-of-epoch-day.function';
import { getZonedParts } from './get-zoned-parts.function';

/**
 * Returns the ISO 8601 week of the local day of a date, with the year it belongs to.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 */
export function getIsoWeek(date: Date): FoundryIsoWeek {
  const epochDay: number = convertCivilDateToEpochDay(getZonedParts(date, 'local'));
  const thursday: number = epochDay + 4 - (getWeekdayOfEpochDay(epochDay) || 7);
  const year: number = convertEpochDayToCivilDate(thursday).year;
  return { year, week: Math.floor((thursday - convertCivilDateToEpochDay({ year, month: 1, day: 1 })) / 7) + 1 };
}
