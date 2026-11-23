import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';

/**
 * Writes the local day of a date, or a calendar day, as midnight UTC: `'2026-03-01T00:00:00.000Z'`.
 * @throws {RangeError} When the date is invalid or outside 1-9999, or the day is not canonical.
 */
export function toUtcCalendarDateString(value: Date | FoundryCalendarDay): string {
  throw new Error('[foundry-utils]: not implemented');
}
