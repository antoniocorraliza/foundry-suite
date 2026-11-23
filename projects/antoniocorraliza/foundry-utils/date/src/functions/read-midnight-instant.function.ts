import { MAX_EPOCH_DAY, MIN_EPOCH_DAY } from '../constants/date-limits.constant';
import { MILLISECONDS_PER_DAY } from '../constants/time-units.constant';
import type { CivilDate } from '../interfaces/civil-date.interface';
import type { DateTextReading } from '../interfaces/date-text-reading.interface';
import type { TimeTextReading } from '../interfaces/time-text-reading.interface';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import type { TimestampUnit } from '../types/timestamp-unit.type';
import { convertEpochDayToCivilDate } from './convert-epoch-day-to-civil-date.function';
import { convertTimestampToMilliseconds } from './convert-timestamp-to-milliseconds.function';
import { readDateText } from './read-date-text.function';
import { readTimeText } from './read-time-text.function';

function readMidnightTimestamp(timestamp: number): CivilDate | null {
  const epochDay: number = timestamp / MILLISECONDS_PER_DAY;
  if (!Number.isInteger(epochDay) || epochDay < MIN_EPOCH_DAY || epochDay > MAX_EPOCH_DAY) return null;
  return convertEpochDayToCivilDate(epochDay);
}

function readMidnightText(text: string, format: FoundryDateFormat): CivilDate | null {
  const reading: DateTextReading | null = readDateText(text, format);
  if (reading === null || reading.rest === '') return reading?.date ?? null;
  const time: TimeTextReading | null = readTimeText(reading.rest, format);
  return time !== null && time.hours === 0 && time.minutes === 0 && time.isWholeMinute ? reading.date : null;
}

/**
 * Reads the day of a value sent as a midnight: the day written in a text whose time is 00:00, or the UTC day of a timestamp at UTC midnight.
 * Returns `null` for any other value.
 */
export function readMidnightInstant(value: string | number, format: FoundryDateFormat, timestampUnit: TimestampUnit): CivilDate | null {
  if (typeof value === 'string') return readMidnightText(value, format);
  return readMidnightTimestamp(convertTimestampToMilliseconds(value, timestampUnit));
}
