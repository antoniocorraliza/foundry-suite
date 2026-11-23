import { ɵisOptionsValue, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { REPEATED_TIMES } from '../constants/repeated-times.constant';
import { TIME_ZONE_MODES } from '../constants/time-zone-modes.constant';
import type { FoundryLocalDateTimeToDateOptions } from '../interfaces/foundry-local-date-time-to-date-options.interface';
import type { FoundryLocalDateTime } from '../types/foundry-local-date-time.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { buildLocalDate } from './build-local-date.function';
import { findLaterLocalDate } from './find-later-local-date.function';
import { isLocalDateTime } from './is-local-date-time.function';

/**
 * Returns the instant of a clock time, or `null` when the time zone skips that time.
 * @throws {RangeError} When the value is not canonical.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function localDateTimeToDate(value: FoundryLocalDateTime, options?: FoundryLocalDateTimeToDateOptions): Date | null {
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of localDateTimeToDate must be an object');
  const timeZone: FoundryTimeZoneMode = ɵparseEnumOption({ options, name: 'timeZone', allowedValues: TIME_ZONE_MODES, fallback: 'local' });
  const repeatedTime: 'earlier' | 'later' = ɵparseEnumOption({
    options,
    name: 'repeatedTime',
    allowedValues: REPEATED_TIMES,
    fallback: 'earlier',
  });
  if (!isLocalDateTime(value)) throw new RangeError(`[foundry-utils]: ${JSON.stringify(value)} is not a canonical YYYY-MM-DDTHH:mm value`);
  const date: Date | null = buildLocalDate(
    { year: Number(value.slice(0, 4)), month: Number(value.slice(5, 7)), day: Number(value.slice(8, 10)) },
    { hours: Number(value.slice(11, 13)), minutes: Number(value.slice(14, 16)), seconds: 0, milliseconds: 0 },
    timeZone,
  );
  return date !== null && timeZone === 'local' && repeatedTime === 'later' ? findLaterLocalDate(date) : date;
}
