import { ɵisOptionsValue } from '@antoniocorraliza/foundry-utils';
import { MAX_CALENDAR_WEEKS } from '../constants/date-limits.constant';
import type { FoundryWeekday } from '../types/foundry-weekday.type';
import { buildLocalDays } from './build-local-days.function';
import { getEpochDayOfDate } from './get-epoch-day-of-date.function';
import { getWeekdayOfEpochDay } from './get-weekday-of-epoch-day.function';
import { parseWeekdayOption } from './parse-weekday-option.function';

/**
 * Returns the days of the week of a date, starting on Monday by default, each at its first instant.
 * @throws {RangeError} When the date is invalid, an option is out of range or a day is skipped by the time zone.
 * @throws {TypeError} When the options are not an object.
 */
export function getCalendarWeek(date: Date, options?: { readonly firstDayOfWeek?: FoundryWeekday; readonly weeks?: number }): Array<Date> {
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of getCalendarWeek must be an object');
  const firstDayOfWeek: FoundryWeekday = parseWeekdayOption(options);
  const weeks: unknown = options?.['weeks'] ?? 1;
  if (!Number.isInteger(weeks) || (weeks as number) < 1 || (weeks as number) > MAX_CALENDAR_WEEKS) {
    throw new RangeError(`[foundry-utils]: weeks must be an integer from 1 to 5228, got ${String(weeks)}`);
  }
  const epochDay: number = getEpochDayOfDate(date);
  const daysSinceFirst: number = (getWeekdayOfEpochDay(epochDay) - firstDayOfWeek + 7) % 7;
  return buildLocalDays(epochDay - daysSinceFirst, (weeks as number) * 7, 1);
}
