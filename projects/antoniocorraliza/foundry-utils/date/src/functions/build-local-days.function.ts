import { MAX_LISTED_DAYS } from '../constants/date-limits.constant';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { convertEpochDayToCalendarDay } from './convert-epoch-day-to-calendar-day.function';
import { getLocalEpochDay } from './get-local-epoch-day.function';
import { getStartOfLocalDay } from './get-start-of-local-day.function';

function buildLocalDay(epochDay: number): Date {
  const day: FoundryCalendarDay = convertEpochDayToCalendarDay(epochDay);
  const start: Date = getStartOfLocalDay(epochDay);
  if (getLocalEpochDay(start) !== epochDay) throw new RangeError(`[foundry-utils]: the local time zone skips the day ${day}`);
  return start;
}

/**
 * Returns `count` local days, `step` days apart from the first one, each built from its parts at its first instant.
 * @throws {RangeError} When the list passes 36600 days, a day is outside 1-9999 or the time zone skips a day.
 */
export function buildLocalDays(firstEpochDay: number, count: number, step: number): Array<Date> {
  if (count > MAX_LISTED_DAYS) throw new RangeError(`[foundry-utils]: a list of days has at most 36600 days, ${count} requested`);
  return Array.from({ length: count }, (_entry, index) => buildLocalDay(firstEpochDay + index * step));
}
