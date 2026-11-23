import { MILLISECONDS_PER_DAY } from '../constants/time-units.constant';
import type { FoundryCalendarDayRange } from '../interfaces/foundry-calendar-day-range.interface';
import type { FoundryInstantRange } from '../interfaces/foundry-instant-range.interface';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { getEpochDay } from './get-epoch-day.function';
import { getStartOfLocalDay } from './get-start-of-local-day.function';
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
  const startDay: number = getEpochDay(range.start);
  const endDay: number = getEpochDay(range.end);
  if (startDay > endDay) throw new RangeError(`[foundry-utils]: the range starts on ${range.start}, after its end ${range.end}`);
  if (timeZone === 'local') return { start: getStartOfLocalDay(startDay), endExclusive: getStartOfLocalDay(endDay + 1) };
  return { start: new Date(startDay * MILLISECONDS_PER_DAY), endExclusive: new Date((endDay + 1) * MILLISECONDS_PER_DAY) };
}
