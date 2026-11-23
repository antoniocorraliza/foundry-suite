import { MILLISECONDS_PER_DAY, MILLISECONDS_PER_HOUR, MILLISECONDS_PER_MINUTE } from '../constants/time-units.constant';
import type { CivilDate } from '../interfaces/civil-date.interface';
import type { ClockTime } from '../interfaces/clock-time.interface';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { createLocalDate } from './create-local-date.function';

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
export function buildLocalDate(date: CivilDate, time: ClockTime, timeZone: FoundryTimeZoneMode): Date | null {
  if (timeZone === 'utc') {
    const timeOfDay: number =
      time.hours * MILLISECONDS_PER_HOUR + time.minutes * MILLISECONDS_PER_MINUTE + time.seconds * 1000 + time.milliseconds;
    return new Date(convertCivilDateToEpochDay(date) * MILLISECONDS_PER_DAY + timeOfDay);
  }
  const result: Date = createLocalDate(date, time);
  return hasClockTime(result, date, time) ? result : null;
}
