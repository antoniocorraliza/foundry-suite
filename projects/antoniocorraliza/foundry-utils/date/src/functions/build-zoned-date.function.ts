import type { CivilDate } from '../interfaces/civil-date.interface';
import type { ClockTime } from '../interfaces/clock-time.interface';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { getMillisecondsOfDay } from './get-milliseconds-of-day.function';
import { getStartOfUtcDay } from './get-start-of-utc-day.function';
import { setLocalClockTime } from './set-local-clock-time.function';

function hasClockTime(result: Date, date: CivilDate, time: ClockTime): boolean {
  return (
    result.getFullYear() === date.year &&
    result.getMonth() + 1 === date.month &&
    result.getDate() === date.day &&
    result.getHours() === time.hours &&
    result.getMinutes() === time.minutes &&
    result.getSeconds() === time.seconds &&
    result.getMilliseconds() === time.milliseconds
  );
}

/** Returns the instant of a clock time in local time or in UTC: `null` when the local clock skips it, and the first one when it repeats. */
export function buildZonedDate(date: CivilDate, time: ClockTime, timeZone: FoundryTimeZoneMode): Date | null {
  if (timeZone === 'utc') return new Date(getStartOfUtcDay(convertCivilDateToEpochDay(date)).getTime() + getMillisecondsOfDay(time));
  const result: Date = setLocalClockTime(date, time);
  return hasClockTime(result, date, time) ? result : null;
}
