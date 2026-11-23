import { CANONICAL_DAY_PATTERN } from '../constants/canonical-patterns.constant';
import { MIN_YEAR } from '../constants/date-limits.constant';
import { convertCivilDateToEpochDay } from './convert-civil-date-to-epoch-day.function';
import { getDaysInMonth } from './get-days-in-month.function';

/** Returns the days from 1970-01-01 to a canonical `'YYYY-MM-DD'` day, or `null` when the value is not one. */
export function convertCalendarDayToEpochDay(value: unknown): number | null {
  const match: RegExpExecArray | null = typeof value === 'string' ? CANONICAL_DAY_PATTERN.exec(value) : null;
  if (match === null) return null;
  const year: number = Number(match[1]);
  const month: number = Number(match[2]);
  const day: number = Number(match[3]);
  if (year < MIN_YEAR || month < 1 || month > 12 || day < 1 || day > getDaysInMonth(year, month)) return null;
  return convertCivilDateToEpochDay({ year, month, day });
}
