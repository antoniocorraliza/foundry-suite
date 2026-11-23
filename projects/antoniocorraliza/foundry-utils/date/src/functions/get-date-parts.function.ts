import type { FoundryDateParts } from '../interfaces/foundry-date-parts.interface';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { getZonedParts } from './get-zoned-parts.function';
import { parseTimeZoneOption } from './parse-time-zone-option.function';

/**
 * Returns the local or UTC parts of a date, with the month from 1 to 12.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function getDateParts(date: Date, options?: { readonly timeZone?: FoundryTimeZoneMode }): Required<FoundryDateParts> {
  return getZonedParts(date, parseTimeZoneOption(options, 'getDateParts'));
}
