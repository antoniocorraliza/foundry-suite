import type { ClockTime } from './clock-time.interface';

/** Holds the time of a parts object, with the missing lower parts at zero, and how many parts it had. */
export interface PartsTime extends ClockTime {
  readonly writtenParts: number;
}
