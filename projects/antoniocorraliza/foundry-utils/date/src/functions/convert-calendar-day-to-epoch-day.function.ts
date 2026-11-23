import { CANONICAL_DAY_PATTERN } from '../constants/canonical-patterns.constant';
import type { CivilDate } from '../interfaces/civil-date.interface';
import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { isExistingCivilDate } from './is-existing-civil-date.function';

/** Returns the days from 1970-01-01 to a canonical `'YYYY-MM-DD'` day, or `null` when the value is not one. */
export function convertCalendarDayToEpochDay(value: unknown): number | null {
  const match: RegExpExecArray | null = typeof value === 'string' ? CANONICAL_DAY_PATTERN.exec(value) : null;
  if (match === null) return null;
  const date: CivilDate = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  return isExistingCivilDate(date) ? convertCivilDateToEpochDay(date) : null;
}
