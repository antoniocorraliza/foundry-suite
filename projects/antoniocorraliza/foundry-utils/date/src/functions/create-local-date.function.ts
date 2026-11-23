import type { CivilDate } from '../interfaces/civil-date.interface';
import type { ClockTime } from '../interfaces/clock-time.interface';

/** Returns the date that JavaScript gives for a local clock time, which moves a skipped time forward and takes the first of a repeated one. */
export function createLocalDate(date: CivilDate, time: ClockTime): Date {
  const result: Date = new Date(0);
  result.setHours(12, 0, 0, 0);
  result.setFullYear(date.year, date.month - 1, date.day);
  result.setHours(time.hours, time.minutes, time.seconds, time.milliseconds);
  return result;
}
