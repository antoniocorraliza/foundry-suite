import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';

/** Tells whether a value is a canonical `'YYYY-MM-DD'` day. */
export function isCalendarDay(value: unknown): value is FoundryCalendarDay {
  throw new Error('[foundry-utils]: not implemented');
}
