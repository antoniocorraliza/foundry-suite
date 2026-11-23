import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { getZonedParts } from './get-zoned-parts.function';
import { parseTimeZoneOption } from './parse-time-zone-option.function';
import { writeCivilDate } from './write-civil-date.function';

/**
 * Returns the local or UTC day of a date.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function toCalendarDay(date: Date, options?: { readonly timeZone?: FoundryTimeZoneMode }): FoundryCalendarDay {
  return writeCivilDate(getZonedParts(date, parseTimeZoneOption(options, 'toCalendarDay')));
}
