import { CANONICAL_DAY_PATTERN } from '../constants/canonical-patterns.constant';
import type { CivilDate } from '../interfaces/civil-date.interface';
import { isExistingCivilDate } from './is-existing-civil-date.function';

/** Reads a canonical `'YYYY-MM-DD'` day, or returns `null` when the value is not one. */
export function readCalendarDay(value: unknown): CivilDate | null {
  const match: RegExpExecArray | null = typeof value === 'string' ? CANONICAL_DAY_PATTERN.exec(value) : null;
  if (match === null) return null;
  const date: CivilDate = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  return isExistingCivilDate(date) ? date : null;
}
