import { ɵcheckOptions, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { DATE_FORMATS } from '../constants/date-formats.constant';
import { DATE_SEPARATORS } from '../constants/date-separators.constant';
import type { FoundryFormatCalendarDayOptions } from '../interfaces/foundry-format-calendar-day-options.interface';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import type { FoundryDateSeparator } from '../types/foundry-date-separator.type';
import { getCalendarDayParts } from './get-calendar-day-parts.function';
import { writeDateText } from './write-date-text.function';

/**
 * Writes a calendar day in the requested format.
 * @throws {RangeError} When the day is not canonical.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function formatCalendarDay(day: FoundryCalendarDay, options?: FoundryFormatCalendarDayOptions): string;

/**
 * Writes a calendar day in the requested format, or returns `null` for `null`.
 * @throws {RangeError} When the day is not canonical.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function formatCalendarDay(day: FoundryCalendarDay | null, options?: FoundryFormatCalendarDayOptions): string | null;

export function formatCalendarDay(day: FoundryCalendarDay | null, options?: FoundryFormatCalendarDayOptions): string | null {
  ɵcheckOptions(options, 'formatCalendarDay');
  const format: FoundryDateFormat = ɵparseEnumOption({ options, name: 'format', allowedValues: DATE_FORMATS, fallback: 'iso' });
  const separator: FoundryDateSeparator = ɵparseEnumOption({ options, name: 'separator', allowedValues: DATE_SEPARATORS, fallback: '/' });
  return day === null ? null : writeDateText(getCalendarDayParts(day), format, separator);
}
