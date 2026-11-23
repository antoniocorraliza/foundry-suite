import { UTC_MIDNIGHT_TEXT } from '../constants/midnight.constant';
import type { CivilDate } from '../interfaces/civil-date.interface';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { getCivilDateOfCalendarDay } from './get-civil-date-of-calendar-day.function';
import { getZonedParts } from './get-zoned-parts.function';
import { writeCivilDate } from './write-civil-date.function';

/**
 * Writes the local day of a date, or a calendar day, as midnight UTC: `'2026-03-01T00:00:00.000Z'`.
 * @throws {RangeError} When the date is invalid or outside 1-9999, or the day is not canonical.
 */
export function toUtcCalendarDateString(value: Date | FoundryCalendarDay): string {
  const date: CivilDate = typeof value === 'string' ? getCivilDateOfCalendarDay(value) : getZonedParts(value, 'local');
  return `${writeCivilDate(date)}T${UTC_MIDNIGHT_TEXT}`;
}
