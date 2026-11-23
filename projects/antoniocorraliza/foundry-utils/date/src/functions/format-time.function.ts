import { ɵisOptionsValue, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { CLOCK_PRECISIONS } from '../constants/clock-precisions.constant';
import { TIME_ZONE_MODES } from '../constants/time-zone-modes.constant';
import type { FoundryDateParts } from '../interfaces/foundry-date-parts.interface';
import type { FoundryTimePrecision } from '../types/foundry-time-precision.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { getZonedParts } from './get-zoned-parts.function';
import { writeTimeText } from './write-time-text.function';

/**
 * Writes the time of a date as `'HH:mm:ss'` by default, ending in `Z` in UTC.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function formatTime(
  date: Date,
  options?: { readonly precision?: Exclude<FoundryTimePrecision, 'none'>; readonly timeZone?: FoundryTimeZoneMode },
): string {
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of formatTime must be an object');
  const precision: Exclude<FoundryTimePrecision, 'none'> = ɵparseEnumOption({
    options,
    name: 'precision',
    allowedValues: CLOCK_PRECISIONS,
    fallback: 'seconds',
  });
  const timeZone: FoundryTimeZoneMode = ɵparseEnumOption({ options, name: 'timeZone', allowedValues: TIME_ZONE_MODES, fallback: 'local' });
  const parts: Required<FoundryDateParts> = getZonedParts(date, timeZone);
  return `${writeTimeText(parts, precision)}${timeZone === 'utc' ? 'Z' : ''}`;
}
