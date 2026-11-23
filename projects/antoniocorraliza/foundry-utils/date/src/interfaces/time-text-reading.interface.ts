import type { ClockTime } from './clock-time.interface';

/** Time read from a text, with its milliseconds truncated, and its offset from UTC in minutes when it has one. */
export interface TimeTextReading extends ClockTime {
  readonly isWholeMinute: boolean;
  readonly offsetMinutes: number | null;
}
