import { MILLISECONDS_PER_MINUTE } from '../constants/time-units.constant';
import type { FoundryDateParts } from '../interfaces/foundry-date-parts.interface';
import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { getMillisecondsOfDay } from './get-milliseconds-of-day.function';
import { getStartOfUtcDay } from './get-start-of-utc-day.function';
import { getZonedParts } from './get-zoned-parts.function';
import { writeCivilDate } from './write-civil-date.function';
import { writeTimeText } from './write-time-text.function';

/**
 * Writes a date in ISO 8601 with the local offset, such as `'2026-07-01T12:00:00.000+02:00'`.
 * @throws {RangeError} When the date is invalid, outside 1-9999, or the local offset has seconds.
 */
export function toIsoStringWithOffset(date: Date): string {
  const parts: Required<FoundryDateParts> = getZonedParts(date, 'local');
  const utcClockTime: number = getStartOfUtcDay(convertCivilDateToEpochDay(parts)).getTime() + getMillisecondsOfDay(parts);
  const offset: number = utcClockTime - Date.prototype.getTime.call(date);
  if (offset % MILLISECONDS_PER_MINUTE !== 0) throw new RangeError('[foundry-utils]: the local offset of the date has seconds');
  const offsetInMinutes: number = Math.abs(offset) / MILLISECONDS_PER_MINUTE;
  const offsetText: string = `${String(Math.floor(offsetInMinutes / 60)).padStart(2, '0')}:${String(offsetInMinutes % 60).padStart(2, '0')}`;
  return `${writeCivilDate(parts)}T${writeTimeText(parts, 'milliseconds')}${offset < 0 ? '-' : '+'}${offsetText}`;
}
