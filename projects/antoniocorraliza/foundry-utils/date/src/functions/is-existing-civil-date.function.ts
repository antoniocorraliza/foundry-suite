import { MAX_YEAR, MIN_YEAR } from '../constants/date-limits.constant';
import type { CivilDate } from '../interfaces/civil-date.interface';
import { getDaysInMonth } from './get-days-in-month.function';

/** Tells whether integer parts name a day of the years 1-9999 that exists. */
export function isExistingCivilDate(date: CivilDate): boolean {
  const { year, month, day } = date;
  return year >= MIN_YEAR && year <= MAX_YEAR && month >= 1 && month <= 12 && day >= 1 && day <= getDaysInMonth(year, month);
}
