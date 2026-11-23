import type { FoundryIsoWeek } from '../interfaces/foundry-iso-week.interface';
import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { convertEpochDayToCivilDate } from './convert-epoch-day-to-civil-date.function';
import { getWeekdayOfEpochDay } from './get-weekday-of-epoch-day.function';

/** Returns the ISO 8601 week of a day counted from 1970-01-01: the week of its Thursday, with the year of that Thursday. */
export function getIsoWeekOfEpochDay(epochDay: number): FoundryIsoWeek {
  const thursday: number = epochDay + 4 - (getWeekdayOfEpochDay(epochDay) || 7);
  const year: number = convertEpochDayToCivilDate(thursday).year;
  return { year, week: Math.floor((thursday - convertCivilDateToEpochDay({ year, month: 1, day: 1 })) / 7) + 1 };
}
