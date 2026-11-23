import type { FoundryDateParts } from '../interfaces/foundry-date-parts.interface';
import type { FoundryLocalDateTime } from '../types/foundry-local-date-time.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { getZonedParts } from './get-zoned-parts.function';
import { parseTimeZoneOption } from './parse-time-zone-option.function';
import { writeLocalDateTime } from './write-local-date-time.function';

/**
 * Returns the local or UTC clock time of a date, truncated to the minute.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function toLocalDateTime(date: Date, options?: { readonly timeZone?: FoundryTimeZoneMode }): FoundryLocalDateTime {
  const parts: Required<FoundryDateParts> = getZonedParts(date, parseTimeZoneOption(options, 'toLocalDateTime'));
  return writeLocalDateTime(parts, parts.hours, parts.minutes);
}
