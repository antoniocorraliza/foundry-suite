import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';

/** How `localDateTimeToDate` reads a clock time and chooses between two repeated times. */
export interface FoundryLocalDateTimeToDateOptions {
  /** Time zone in which the clock time is read; `'local'` by default. */
  readonly timeZone?: FoundryTimeZoneMode;
  /** Which of two repeated clock times is returned; `'earlier'` by default. */
  readonly repeatedTime?: 'earlier' | 'later';
}
