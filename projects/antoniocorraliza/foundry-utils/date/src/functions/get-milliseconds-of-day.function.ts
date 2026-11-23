import { MILLISECONDS_PER_HOUR, MILLISECONDS_PER_MINUTE, MILLISECONDS_PER_SECOND } from '../constants/time-units.constant';
import type { ClockTime } from '../interfaces/clock-time.interface';

/** Returns the milliseconds from the start of a day of 24 hours to a clock time. */
export function getMillisecondsOfDay(time: ClockTime): number {
  return (
    time.hours * MILLISECONDS_PER_HOUR + time.minutes * MILLISECONDS_PER_MINUTE + time.seconds * MILLISECONDS_PER_SECOND + time.milliseconds
  );
}
