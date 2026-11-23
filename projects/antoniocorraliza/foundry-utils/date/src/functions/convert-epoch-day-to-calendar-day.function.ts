import { MAX_EPOCH_DAY, MIN_EPOCH_DAY } from '../constants/date-limits.constant';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { convertEpochDayToCivilDate } from './convert-epoch-day-to-civil-date.function';
import { writeCivilDate } from './write-civil-date.function';

/**
 * Returns the canonical day that is a number of days after 1970-01-01.
 * @throws {RangeError} When the day is outside 0001-01-01 to 9999-12-31.
 */
export function convertEpochDayToCalendarDay(epochDay: number): FoundryCalendarDay {
  if (!(epochDay >= MIN_EPOCH_DAY && epochDay <= MAX_EPOCH_DAY)) throw new RangeError('[foundry-utils]: the day is outside 0001-9999');
  return writeCivilDate(convertEpochDayToCivilDate(epochDay));
}
