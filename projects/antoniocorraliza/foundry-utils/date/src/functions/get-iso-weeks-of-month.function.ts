import type { FoundryDateParts } from '../interfaces/foundry-date-parts.interface';
import type { FoundryIsoWeek } from '../interfaces/foundry-iso-week.interface';
import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { getDaysInMonth } from './get-days-in-month.function';
import { getIsoWeekOfEpochDay } from './get-iso-week-of-epoch-day.function';
import { getZonedParts } from './get-zoned-parts.function';

/**
 * Returns the ISO 8601 weeks of the days of the local month of a date, in order.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 */
export function getIsoWeeksOfMonth(date: Date): Array<FoundryIsoWeek> {
  const parts: Required<FoundryDateParts> = getZonedParts(date, 'local');
  const firstOfMonth: number = convertCivilDateToEpochDay({ year: parts.year, month: parts.month, day: 1 });
  const weeks: Array<FoundryIsoWeek> = Array.from({ length: getDaysInMonth(parts.year, parts.month) }, (_entry, index) =>
    getIsoWeekOfEpochDay(firstOfMonth + index),
  );
  return weeks.filter((week, index) => weeks[index - 1]?.week !== week.week);
}
