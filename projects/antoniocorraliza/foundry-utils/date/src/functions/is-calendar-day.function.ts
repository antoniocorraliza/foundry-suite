import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { readCalendarDay } from './read-calendar-day.function';

/** Tells whether a value is a canonical `'YYYY-MM-DD'` day. */
export function isCalendarDay(value: unknown): value is FoundryCalendarDay {
  return readCalendarDay(value) !== null;
}
