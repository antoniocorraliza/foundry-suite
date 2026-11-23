import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { getZonedParts } from './get-zoned-parts.function';
import { parseTimeZoneOption } from './parse-time-zone-option.function';
import { writeCivilDate } from './write-civil-date.function';

/**
 * Returns the local or UTC day of the current time.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function getTodayCalendarDay(options?: { readonly timeZone?: FoundryTimeZoneMode }): FoundryCalendarDay {
  return writeCivilDate(getZonedParts(new Date(), parseTimeZoneOption(options, 'getTodayCalendarDay')));
}
