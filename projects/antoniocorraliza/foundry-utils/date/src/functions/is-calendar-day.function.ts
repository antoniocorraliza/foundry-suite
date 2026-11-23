import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { convertCalendarDayToEpochDay } from './convert-calendar-day-to-epoch-day.function';

/** Tells whether a value is a canonical `'YYYY-MM-DD'` day. */
export function isCalendarDay(value: unknown): value is FoundryCalendarDay {
  return convertCalendarDayToEpochDay(value) !== null;
}
