import { ɵisOptionsValue, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { DATE_FORMATS } from '../constants/date-formats.constant';
import type { DatePartsReading } from '../interfaces/date-parts-reading.interface';
import type { DateTextReading } from '../interfaces/date-text-reading.interface';
import type { FoundryParseLocalDateTimeOptions } from '../interfaces/foundry-parse-local-date-time-options.interface';
import type { TimeTextReading } from '../interfaces/time-text-reading.interface';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import type { FoundryLocalDateTime } from '../types/foundry-local-date-time.type';
import { readDateParts } from './read-date-parts.function';
import { readDateText } from './read-date-text.function';
import { readTimeText } from './read-time-text.function';
import { writeCivilDate } from './write-civil-date.function';

function writeLocalDateTime(day: string, hours: number, minutes: number): FoundryLocalDateTime {
  return `${day}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function readLocalDateTimeText(text: string, format: FoundryDateFormat): FoundryLocalDateTime | null {
  const reading: DateTextReading | null = readDateText(text, format);
  const time: TimeTextReading | null = reading === null ? null : readTimeText(reading.rest, format);
  if (reading === null || time === null || time.offsetMinutes !== null || !time.isWholeMinute) return null;
  return writeLocalDateTime(writeCivilDate(reading.date), time.hours, time.minutes);
}

function readLocalDateTimeParts(value: unknown): FoundryLocalDateTime | null {
  const parts: DatePartsReading | null = readDateParts(value);
  const time: DatePartsReading['time'] = parts?.time ?? null;
  if (parts === null || time === null || time.writtenParts < 2 || time.seconds !== 0 || time.milliseconds !== 0) return null;
  return writeLocalDateTime(writeCivilDate(parts.date), time.hours, time.minutes);
}

/**
 * Converts unvalidated data into a canonical `'YYYY-MM-DDTHH:mm'` value, or returns `null`, without looking at the time zone.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function parseLocalDateTime(value: unknown, options?: FoundryParseLocalDateTimeOptions): FoundryLocalDateTime | null {
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of parseLocalDateTime must be an object');
  const format: FoundryDateFormat = ɵparseEnumOption({ options, name: 'format', allowedValues: DATE_FORMATS, fallback: 'iso' });
  return typeof value === 'string' ? readLocalDateTimeText(value, format) : readLocalDateTimeParts(value);
}
