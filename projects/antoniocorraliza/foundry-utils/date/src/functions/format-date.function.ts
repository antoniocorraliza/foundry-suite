import { ɵisOptionsValue, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { DATE_FORMATS } from '../constants/date-formats.constant';
import { DATE_SEPARATORS } from '../constants/date-separators.constant';
import { TIME_PRECISIONS } from '../constants/time-precisions.constant';
import { TIME_ZONE_MODES } from '../constants/time-zone-modes.constant';
import type { FoundryDateParts } from '../interfaces/foundry-date-parts.interface';
import type { FoundryFormatDateOptions } from '../interfaces/foundry-format-date-options.interface';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import type { FoundryDateSeparator } from '../types/foundry-date-separator.type';
import type { FoundryTimePrecision } from '../types/foundry-time-precision.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { getZonedParts } from './get-zoned-parts.function';
import { writeDateText } from './write-date-text.function';
import { writeTimeText } from './write-time-text.function';

/**
 * Writes a date as text, or returns `null` for `null`.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function formatDate(date: Date, options?: FoundryFormatDateOptions): string;

/**
 * Writes a date as text, or returns `null` for `null`.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function formatDate(date: Date | null, options?: FoundryFormatDateOptions): string | null;

export function formatDate(date: Date | null, options?: FoundryFormatDateOptions): string | null {
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of formatDate must be an object');
  const format: FoundryDateFormat = ɵparseEnumOption({ options, name: 'format', allowedValues: DATE_FORMATS, fallback: 'iso' });
  const separator: FoundryDateSeparator = ɵparseEnumOption({ options, name: 'separator', allowedValues: DATE_SEPARATORS, fallback: '/' });
  const time: FoundryTimePrecision = ɵparseEnumOption({ options, name: 'time', allowedValues: TIME_PRECISIONS, fallback: 'none' });
  const timeZone: FoundryTimeZoneMode = ɵparseEnumOption({ options, name: 'timeZone', allowedValues: TIME_ZONE_MODES, fallback: 'local' });
  if (date === null) return null;
  const parts: Required<FoundryDateParts> = getZonedParts(date, timeZone);
  const dateText: string = writeDateText(parts, format, separator);
  if (time === 'none') return dateText;
  if (format !== 'iso') return `${dateText} ${writeTimeText(parts, time)}`;
  return `${dateText}T${writeTimeText(parts, time)}${timeZone === 'utc' ? 'Z' : ''}`;
}
