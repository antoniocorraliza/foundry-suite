import type { FoundryWeekday } from '../types/foundry-weekday.type';

/** Parts of a calendar day, with its weekday. */
export interface FoundryCalendarDayParts {
  /** Year, from 1 to 9999. */
  readonly year: number;
  /** Month, from 1 to 12. */
  readonly month: number;
  /** Day of the month, from 1 to 31. */
  readonly day: number;
  /** Day of the week, 0 for Sunday. */
  readonly weekday: FoundryWeekday;
}
