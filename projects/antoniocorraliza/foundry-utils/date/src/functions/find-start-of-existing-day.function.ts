import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { getEpochDayOfValidDate } from './get-epoch-day-of-valid-date.function';
import { getStartOfLocalDay } from './get-start-of-local-day.function';
import { getStartOfUtcDay } from './get-start-of-utc-day.function';

/** Returns the first instant of a day counted from 1970-01-01 in local time or in UTC, or `null` when the local time zone skips the whole day. */
export function findStartOfExistingDay(epochDay: number, timeZone: FoundryTimeZoneMode): Date | null {
  if (timeZone === 'utc') return getStartOfUtcDay(epochDay);
  const start: Date = getStartOfLocalDay(epochDay);
  return getEpochDayOfValidDate(start) === epochDay ? start : null;
}
