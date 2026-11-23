import type { CivilDate } from '../interfaces/civil-date.interface';

/** Returns the days from 1970-01-01 to a day of the years 1-9999, with integer arithmetic and without `Date`. */
export function convertCivilDateToEpochDay(date: CivilDate): number {
  const year: number = date.month <= 2 ? date.year - 1 : date.year;
  const era: number = Math.floor(year / 400);
  const yearOfEra: number = year - era * 400;
  const dayOfYear: number = Math.floor((153 * (date.month > 2 ? date.month - 3 : date.month + 9) + 2) / 5) + date.day - 1;
  const dayOfEra: number = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
  return era * 146_097 + dayOfEra - 719_468;
}
