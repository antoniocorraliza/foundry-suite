import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';

/** Range of days with both ends included. */
export interface FoundryCalendarDayRange {
  /** First day of the range. */
  readonly start: FoundryCalendarDay;
  /** Last day of the range, not before `start`. */
  readonly end: FoundryCalendarDay;
}
