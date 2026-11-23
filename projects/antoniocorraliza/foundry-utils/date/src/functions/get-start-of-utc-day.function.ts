import { MILLISECONDS_PER_DAY } from '../constants/time-units.constant';

/** Returns the UTC midnight of a day counted from 1970-01-01. */
export function getStartOfUtcDay(epochDay: number): Date {
  return new Date(epochDay * MILLISECONDS_PER_DAY);
}
