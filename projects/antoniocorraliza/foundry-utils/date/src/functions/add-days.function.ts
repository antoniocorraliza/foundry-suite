import type { CivilDate } from '../interfaces/civil-date.interface';
import type { FoundryDateParts } from '../interfaces/foundry-date-parts.interface';
import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { getStartOfExistingLocalDay } from './get-start-of-existing-local-day.function';
import { getZonedParts } from './get-zoned-parts.function';
import { setLocalClockTime } from './set-local-clock-time.function';

/**
 * Adds calendar days to a date and keeps its local time.
 * @throws {RangeError} When the date is invalid, `days` is not an integer, the target day is skipped by the time zone or the result is outside 1-9999.
 */
export function addDays(date: Date, days: number): Date {
  const parts: Required<FoundryDateParts> = getZonedParts(date, 'local');
  if (!Number.isInteger(days)) throw new RangeError(`[foundry-utils]: the days to add must be an integer, got ${String(days)}`);
  const targetEpochDay: number = convertCivilDateToEpochDay(parts) + days;
  const targetDay: CivilDate = getZonedParts(getStartOfExistingLocalDay(targetEpochDay), 'local');
  return setLocalClockTime(targetDay, parts);
}
