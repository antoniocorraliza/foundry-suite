import { ɵisOptionsValue, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { DATE_FORMATS } from '../constants/date-formats.constant';
import { TIMESTAMP_UNITS } from '../constants/timestamp-units.constant';
import type { CivilDate } from '../interfaces/civil-date.interface';
import type { DatePartsReading } from '../interfaces/date-parts-reading.interface';
import type { DateTextReading } from '../interfaces/date-text-reading.interface';
import type { FoundryParseCalendarDayOptions } from '../interfaces/foundry-parse-calendar-day-options.interface';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import { parseBooleanOption } from './parse-boolean-option.function';
import { readDateParts } from './read-date-parts.function';
import { readDateText } from './read-date-text.function';
import { readMidnightInstant } from './read-midnight-instant.function';
import { writeCivilDate } from './write-civil-date.function';

function readDay(value: unknown, format: FoundryDateFormat): CivilDate | null {
  if (typeof value === 'string') {
    const reading: DateTextReading | null = readDateText(value, format);
    return reading?.rest === '' ? reading.date : null;
  }
  const parts: DatePartsReading | null = readDateParts(value);
  return parts?.date ?? null;
}

/**
 * Converts unvalidated data into a canonical `'YYYY-MM-DD'` day, or returns `null`, without looking at the time zone.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function parseCalendarDay(value: unknown, options?: FoundryParseCalendarDayOptions): FoundryCalendarDay | null {
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of parseCalendarDay must be an object');
  const format: FoundryDateFormat = ɵparseEnumOption({ options, name: 'format', allowedValues: DATE_FORMATS, fallback: 'iso' });
  const canReadMidnightInstant: boolean = parseBooleanOption(options, 'acceptMidnightInstant');
  const timestampUnit: 'milliseconds' | 'seconds' = ɵparseEnumOption({
    options,
    name: 'timestampUnit',
    allowedValues: TIMESTAMP_UNITS,
    fallback: 'milliseconds',
  });
  const date: CivilDate | null =
    canReadMidnightInstant && (typeof value === 'string' || typeof value === 'number')
      ? readMidnightInstant(value, format, timestampUnit)
      : readDay(value, format);
  return date === null ? null : writeCivilDate(date);
}
