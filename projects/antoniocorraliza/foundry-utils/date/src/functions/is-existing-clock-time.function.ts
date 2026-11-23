import { TIME_PARTS } from '../constants/time-parts.constant';
import type { ClockTime } from '../interfaces/clock-time.interface';

/** Tells whether the parts of a clock time are within their largest values. */
export function isExistingClockTime(time: ClockTime): boolean {
  return TIME_PARTS.every((part) => time[part.name] <= part.maximum);
}
