import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';

/** Returns the days from 1970-01-01 to the local day of a date that is already known to be valid. */
export function getEpochDayOfValidDate(date: Date): number {
  return convertCivilDateToEpochDay({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
}
