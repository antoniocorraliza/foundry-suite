import { MAX_EPOCH_DAY, MAX_YEAR, MIN_EPOCH_DAY, MIN_YEAR } from '../constants/date-limits.constant';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';
import { convertEpochDayToCivilDate } from './convert-epoch-day-to-civil-date.function';
import { writeCivilDate } from './write-civil-date.function';

/**
 * Returns the canonical day that is a number of days after 1970-01-01.
 * @throws {RangeError} When the day is outside 1-9999.
 */
export function convertEpochDayToCalendarDay(epochDay: number): FoundryCalendarDay {
  if (!(epochDay >= MIN_EPOCH_DAY && epochDay <= MAX_EPOCH_DAY)) {
    throw new RangeError(`[foundry-utils]: the day is outside ${MIN_YEAR}-${MAX_YEAR}`);
  }
  return writeCivilDate(convertEpochDayToCivilDate(epochDay));
}
