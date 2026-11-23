import type { FoundryFormatCalendarDayOptions } from '../interfaces/foundry-format-calendar-day-options.interface';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';

/**
 * Writes a calendar day in the requested format, or returns `null` for `null`.
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
  throw new Error('[foundry-utils]: not implemented');
}
