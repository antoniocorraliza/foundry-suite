import { CANONICAL_LOCAL_DATE_TIME_PATTERN } from '../constants/canonical-patterns.constant';
import type { CivilDate } from '../interfaces/civil-date.interface';
import type { CivilDateTime } from '../interfaces/civil-date-time.interface';
import type { ClockTime } from '../interfaces/clock-time.interface';
import { isExistingCivilDate } from './is-existing-civil-date.function';
import { isExistingClockTime } from './is-existing-clock-time.function';

/** Reads a canonical `'YYYY-MM-DDTHH:mm'` value, or returns `null` when the value is not one. */
export function readLocalDateTime(value: unknown): CivilDateTime | null {
  const match: RegExpExecArray | null = typeof value === 'string' ? CANONICAL_LOCAL_DATE_TIME_PATTERN.exec(value) : null;
  if (match === null) return null;
  const date: CivilDate = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  const time: ClockTime = { hours: Number(match[4]), minutes: Number(match[5]), seconds: 0, milliseconds: 0 };
  return isExistingCivilDate(date) && isExistingClockTime(time) ? { date, time } : null;
}
