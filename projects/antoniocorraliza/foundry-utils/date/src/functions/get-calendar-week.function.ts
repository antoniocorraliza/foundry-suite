import { ɵcheckOptions, ɵparseIntegerOption } from '@antoniocorraliza/foundry-utils';
import { MAX_CALENDAR_WEEKS } from '../constants/date-limits.constant';
import type { FoundryWeekday } from '../types/foundry-weekday.type';
import { buildLocalDays } from './build-local-days.function';
import { getEpochDayOfDate } from './get-epoch-day-of-date.function';
import { getWeekdayOfEpochDay } from './get-weekday-of-epoch-day.function';
import { parseWeekdayOption } from './parse-weekday-option.function';

/**
 * Returns the days of the week of a date, starting on Monday by default, each at its first instant.
 * @throws {RangeError} When the date is invalid, an option is out of range or a day is skipped by the time zone.
 * @throws {TypeError} When the options are not an object or an option is not a number.
 */
export function getCalendarWeek(date: Date, options?: { readonly firstDayOfWeek?: FoundryWeekday; readonly weeks?: number }): Array<Date> {
  ɵcheckOptions(options, 'getCalendarWeek');
  const firstDayOfWeek: FoundryWeekday = parseWeekdayOption(options);
  const weeks: number = ɵparseIntegerOption({ options, name: 'weeks', minimum: 1, maximum: MAX_CALENDAR_WEEKS, fallback: 1 });
  const epochDay: number = getEpochDayOfDate(date);
  const daysSinceFirst: number = (getWeekdayOfEpochDay(epochDay) - firstDayOfWeek + 7) % 7;
  return buildLocalDays(epochDay - daysSinceFirst, weeks * 7, 1);
}
