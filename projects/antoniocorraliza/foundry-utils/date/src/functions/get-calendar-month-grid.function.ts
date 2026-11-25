import { ɵcheckOptions } from '@antoniocorraliza/foundry-utils';
import type { FoundryDateParts } from '../interfaces/foundry-date-parts.interface';
import type { FoundryWeekday } from '../types/foundry-weekday.type';
import { buildLocalDays } from './build-local-days.function';
import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { getWeekdayOfEpochDay } from './get-weekday-of-epoch-day.function';
import { getZonedParts } from './get-zoned-parts.function';
import { parseWeekdayOption } from './parse-weekday-option.function';

/**
 * Returns the 42 days of the month grid of a date, starting on Monday by default.
 * @throws {RangeError} When the date is invalid, `firstDayOfWeek` is out of range or a day is skipped by the time zone.
 * @throws {TypeError} When the options are not an object.
 */
export function getCalendarMonthGrid(date: Date, options?: { readonly firstDayOfWeek?: FoundryWeekday }): Array<Date> {
  ɵcheckOptions(options, 'getCalendarMonthGrid');
  const firstDayOfWeek: FoundryWeekday = parseWeekdayOption(options);
  const parts: Required<FoundryDateParts> = getZonedParts(date, 'local');
  const firstOfMonth: number = convertCivilDateToEpochDay({ year: parts.year, month: parts.month, day: 1 });
  const daysSinceFirst: number = (getWeekdayOfEpochDay(firstOfMonth) - firstDayOfWeek + 7) % 7;
  return buildLocalDays(firstOfMonth - daysSinceFirst, 42, 1);
}
