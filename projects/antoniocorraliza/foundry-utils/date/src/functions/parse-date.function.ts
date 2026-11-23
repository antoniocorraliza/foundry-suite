import { ɵisOptionsValue, ɵparseBooleanOption, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { DATE_FORMATS } from '../constants/date-formats.constant';
import { MAX_TIME, MAX_YEAR, MIN_TIME, MIN_YEAR } from '../constants/date-limits.constant';
import { MILLISECONDS_PER_MINUTE } from '../constants/time-units.constant';
import { TIME_ZONE_MODES } from '../constants/time-zone-modes.constant';
import { TIMESTAMP_UNITS } from '../constants/timestamp-units.constant';
import type { CivilDate } from '../interfaces/civil-date.interface';
import type { DatePartsReading } from '../interfaces/date-parts-reading.interface';
import type { DateTextReading } from '../interfaces/date-text-reading.interface';
import type { FoundryParseDateOptions } from '../interfaces/foundry-parse-date-options.interface';
import type { TimeTextReading } from '../interfaces/time-text-reading.interface';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import type { TimestampUnit } from '../types/timestamp-unit.type';
import { buildZonedDate } from './build-zoned-date.function';
import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { convertTimestampToMilliseconds } from './convert-timestamp-to-milliseconds.function';
import { findStartOfExistingDay } from './find-start-of-existing-day.function';
import { getMillisecondsOfDay } from './get-milliseconds-of-day.function';
import { getStartOfUtcDay } from './get-start-of-utc-day.function';
import { readDateParts } from './read-date-parts.function';
import { readDateText } from './read-date-text.function';
import { readDateTime } from './read-date-time.function';
import { readMidnightInstant } from './read-midnight-instant.function';
import { readTimeText } from './read-time-text.function';

function isYearInRange(date: Date, timeZone: FoundryTimeZoneMode): boolean {
  const year: number = timeZone === 'utc' ? date.getUTCFullYear() : date.getFullYear();
  return year >= MIN_YEAR && year <= MAX_YEAR;
}

function createDateInRange(time: number, timeZone: FoundryTimeZoneMode): Date | null {
  const copy: Date = new Date(time);
  return !Number.isNaN(time) && isYearInRange(copy, timeZone) ? copy : null;
}

function readTimestamp(timestamp: number, timestampUnit: TimestampUnit): Date | null {
  const time: number = Math.trunc(convertTimestampToMilliseconds(timestamp, timestampUnit));
  return time >= MIN_TIME && time <= MAX_TIME ? new Date(time) : null;
}

function readZonedText(date: CivilDate, time: TimeTextReading, offsetMinutes: number, timeZone: FoundryTimeZoneMode): Date | null {
  const utcTime: number = getStartOfUtcDay(convertCivilDateToEpochDay(date)).getTime() + getMillisecondsOfDay(time);
  return createDateInRange(utcTime - offsetMinutes * MILLISECONDS_PER_MINUTE, timeZone);
}

function readText(text: string, format: FoundryDateFormat, timeZone: FoundryTimeZoneMode): Date | null {
  const reading: DateTextReading | null = readDateText(text, format);
  if (reading === null) return null;
  if (reading.rest === '') return findStartOfExistingDay(convertCivilDateToEpochDay(reading.date), timeZone);
  const time: TimeTextReading | null = readTimeText(reading.rest, format);
  if (time === null) return null;
  return time.offsetMinutes === null
    ? buildZonedDate(reading.date, time, timeZone)
    : readZonedText(reading.date, time, time.offsetMinutes, timeZone);
}

function readParts(value: unknown, timeZone: FoundryTimeZoneMode): Date | null {
  const parts: DatePartsReading | null = readDateParts(value);
  if (parts === null || parts.time === null) return null;
  return parts.time.writtenParts === 0
    ? findStartOfExistingDay(convertCivilDateToEpochDay(parts.date), timeZone)
    : buildZonedDate(parts.date, parts.time, timeZone);
}

/**
 * Converts unvalidated data into a valid `Date`, or returns `null`; it never returns an invalid date.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function parseDate(value: unknown, options?: FoundryParseDateOptions): Date | null {
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of parseDate must be an object');
  const format: FoundryDateFormat = ɵparseEnumOption({ options, name: 'format', allowedValues: DATE_FORMATS, fallback: 'iso' });
  const timeZone: FoundryTimeZoneMode = ɵparseEnumOption({ options, name: 'timeZone', allowedValues: TIME_ZONE_MODES, fallback: 'local' });
  const isCalendarDate: boolean = ɵparseBooleanOption({ options, name: 'calendarDate', fallback: false });
  const timestampUnit: TimestampUnit = ɵparseEnumOption({
    options,
    name: 'timestampUnit',
    allowedValues: TIMESTAMP_UNITS,
    fallback: 'milliseconds',
  });
  const dateTime: number | null = readDateTime(value);
  if (dateTime !== null) return createDateInRange(dateTime, timeZone);
  if (isCalendarDate && (typeof value === 'string' || typeof value === 'number')) {
    const day: CivilDate | null = readMidnightInstant(value, format, timestampUnit);
    return day === null ? null : findStartOfExistingDay(convertCivilDateToEpochDay(day), timeZone);
  }
  if (typeof value === 'number') return readTimestamp(value, timestampUnit);
  return typeof value === 'string' ? readText(value, format, timeZone) : readParts(value, timeZone);
}
