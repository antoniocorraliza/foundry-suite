import type { FoundryDateParts } from '../interfaces/foundry-date-parts.interface';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';

/**
 * Returns the local or UTC parts of a date, with the month from 1 to 12.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function getDateParts(date: Date, options?: { readonly timeZone?: FoundryTimeZoneMode }): Required<FoundryDateParts> {
  throw new Error('[foundry-utils]: not implemented');
}
