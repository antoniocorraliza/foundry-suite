import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';

/**
 * Returns the local or UTC day of the current time.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function getTodayCalendarDay(options?: { readonly timeZone?: FoundryTimeZoneMode }): FoundryCalendarDay {
  throw new Error('[foundry-utils]: not implemented');
}
