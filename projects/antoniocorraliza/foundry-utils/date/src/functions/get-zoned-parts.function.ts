import { MAX_YEAR, MIN_YEAR } from '../constants/date-limits.constant';
import type { FoundryDateParts } from '../interfaces/foundry-date-parts.interface';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { getValidTime } from './get-valid-time.function';

function readLocalParts(date: Date): Required<FoundryDateParts> {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    milliseconds: date.getMilliseconds(),
  };
}

function readUtcParts(date: Date): Required<FoundryDateParts> {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
    seconds: date.getUTCSeconds(),
    milliseconds: date.getUTCMilliseconds(),
  };
}

/**
 * Returns the parts of a date in local time or in UTC.
 * @throws {RangeError} When the date is invalid or its year in that mode is outside 1-9999.
 */
export function getZonedParts(date: Date, timeZone: FoundryTimeZoneMode): Required<FoundryDateParts> {
  const copy: Date = new Date(getValidTime(date));
  const parts: Required<FoundryDateParts> = timeZone === 'utc' ? readUtcParts(copy) : readLocalParts(copy);
  if (parts.year < MIN_YEAR || parts.year > MAX_YEAR) {
    throw new RangeError(`[foundry-utils]: the year ${parts.year} is outside ${MIN_YEAR}-${MAX_YEAR}`);
  }
  return parts;
}
