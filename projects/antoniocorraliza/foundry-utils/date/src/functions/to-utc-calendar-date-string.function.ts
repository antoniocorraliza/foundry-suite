import { MIDNIGHT } from '../constants/midnight.constant';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { getEpochDay } from './get-epoch-day.function';
import { getZonedParts } from './get-zoned-parts.function';
import { writeCivilDate } from './write-civil-date.function';
import { writeTimeText } from './write-time-text.function';

/**
 * Writes the local day of a date, or a calendar day, as midnight UTC: `'2026-03-01T00:00:00.000Z'`.
 * @throws {RangeError} When the date is invalid or outside 1-9999, or the day is not canonical.
 */
export function toUtcCalendarDateString(value: Date | FoundryCalendarDay): string {
  if (typeof value === 'string') getEpochDay(value);
  const day: FoundryCalendarDay = typeof value === 'string' ? value : writeCivilDate(getZonedParts(value, 'local'));
  return `${day}T${writeTimeText(MIDNIGHT, 'milliseconds')}Z`;
}
