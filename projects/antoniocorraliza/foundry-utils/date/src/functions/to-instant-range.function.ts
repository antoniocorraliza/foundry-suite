import type { FoundryCalendarDayRange } from '../interfaces/foundry-calendar-day-range.interface';
import type { FoundryInstantRange } from '../interfaces/foundry-instant-range.interface';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { getEpochDayOfCalendarDay } from './get-epoch-day-of-calendar-day.function';
import { getStartOfLocalDay } from './get-start-of-local-day.function';
import { getStartOfUtcDay } from './get-start-of-utc-day.function';
import { parseTimeZoneOption } from './parse-time-zone-option.function';

/**
 * Returns the half-open range of instants of a day or a range of days, without gaps or overlaps.
 * @throws {RangeError} When a day is not canonical or the range starts after it ends.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function toInstantRange(
  days: FoundryCalendarDay | FoundryCalendarDayRange,
  options?: { readonly timeZone?: FoundryTimeZoneMode },
): FoundryInstantRange {
  const timeZone: FoundryTimeZoneMode = parseTimeZoneOption(options, 'toInstantRange');
  const range: FoundryCalendarDayRange = typeof days === 'string' ? { start: days, end: days } : days;
  const startDay: number = getEpochDayOfCalendarDay(range.start);
  const endDay: number = getEpochDayOfCalendarDay(range.end);
  if (startDay > endDay) throw new RangeError(`[foundry-utils]: the range starts on ${range.start}, after its end ${range.end}`);
  if (timeZone === 'local') return { start: getStartOfLocalDay(startDay), endExclusive: getStartOfLocalDay(endDay + 1) };
  return { start: getStartOfUtcDay(startDay), endExclusive: getStartOfUtcDay(endDay + 1) };
}
