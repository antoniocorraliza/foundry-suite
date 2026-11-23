import { MILLISECONDS_PER_DAY, MILLISECONDS_PER_HOUR, MILLISECONDS_PER_MINUTE } from '../constants/time-units.constant';
import type { FoundryDateParts } from '../interfaces/foundry-date-parts.interface';
import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { getValidTime } from './get-valid-time.function';
import { getZonedParts } from './get-zoned-parts.function';
import { writeCivilDate } from './write-civil-date.function';
import { writeTimeText } from './write-time-text.function';

function getOffsetInMilliseconds(parts: Required<FoundryDateParts>, time: number): number {
  const clockTime: number =
    parts.hours * MILLISECONDS_PER_HOUR + parts.minutes * MILLISECONDS_PER_MINUTE + parts.seconds * 1000 + parts.milliseconds;
  return convertCivilDateToEpochDay(parts) * MILLISECONDS_PER_DAY + clockTime - time;
}

/**
 * Writes a date in ISO 8601 with the local offset, such as `'2026-07-01T12:00:00.000+02:00'`.
 * @throws {RangeError} When the date is invalid, outside 1-9999, or the local offset has seconds.
 */
export function toIsoStringWithOffset(date: Date): string {
  const time: number = getValidTime(date);
  const parts: Required<FoundryDateParts> = getZonedParts(date, 'local');
  const offset: number = getOffsetInMilliseconds(parts, time);
  if (offset % MILLISECONDS_PER_MINUTE !== 0) throw new RangeError('[foundry-utils]: the local offset of the date has seconds');
  const offsetInMinutes: number = Math.abs(offset) / MILLISECONDS_PER_MINUTE;
  const offsetText: string = `${String(Math.floor(offsetInMinutes / 60)).padStart(2, '0')}:${String(offsetInMinutes % 60).padStart(2, '0')}`;
  return `${writeCivilDate(parts)}T${writeTimeText(parts, 'milliseconds')}${offset < 0 ? '-' : '+'}${offsetText}`;
}
