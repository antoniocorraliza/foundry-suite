import { ɵisOptionsValue, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { DATE_FORMATS } from '../constants/date-formats.constant';
import { DATE_SEPARATORS } from '../constants/date-separators.constant';
import type { FoundryFormatLocalDateTimeOptions } from '../interfaces/foundry-format-local-date-time-options.interface';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import type { FoundryDateSeparator } from '../types/foundry-date-separator.type';
import type { FoundryLocalDateTime } from '../types/foundry-local-date-time.type';
import { getCalendarDayParts } from './get-calendar-day-parts.function';
import { isLocalDateTime } from './is-local-date-time.function';
import { writeDateText } from './write-date-text.function';

/**
 * Writes a local date and time in the requested format, or returns `null` for `null`.
 * @throws {RangeError} When the value is not canonical.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function formatLocalDateTime(value: FoundryLocalDateTime, options?: FoundryFormatLocalDateTimeOptions): string;

/**
 * Writes a local date and time in the requested format, or returns `null` for `null`.
 * @throws {RangeError} When the value is not canonical.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function formatLocalDateTime(value: FoundryLocalDateTime | null, options?: FoundryFormatLocalDateTimeOptions): string | null;

export function formatLocalDateTime(value: FoundryLocalDateTime | null, options?: FoundryFormatLocalDateTimeOptions): string | null {
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of formatLocalDateTime must be an object');
  const format: FoundryDateFormat = ɵparseEnumOption({ options, name: 'format', allowedValues: DATE_FORMATS, fallback: 'iso' });
  const separator: FoundryDateSeparator = ɵparseEnumOption({ options, name: 'separator', allowedValues: DATE_SEPARATORS, fallback: '/' });
  if (value === null) return null;
  if (!isLocalDateTime(value)) throw new RangeError(`[foundry-utils]: ${JSON.stringify(value)} is not a canonical YYYY-MM-DDTHH:mm value`);
  const dateText: string = writeDateText(getCalendarDayParts(value.slice(0, 10)), format, separator);
  return `${dateText}${format === 'iso' ? 'T' : ' '}${value.slice(11)}`;
}
