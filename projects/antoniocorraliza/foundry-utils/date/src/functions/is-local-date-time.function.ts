import { CANONICAL_LOCAL_DATE_TIME_PATTERN } from '../constants/canonical-patterns.constant';
import type { FoundryLocalDateTime } from '../types/foundry-local-date-time.type';
import { isCalendarDay } from './is-calendar-day.function';

/** Tells whether a value is a canonical `'YYYY-MM-DDTHH:mm'` value. */
export function isLocalDateTime(value: unknown): value is FoundryLocalDateTime {
  const match: RegExpExecArray | null = typeof value === 'string' ? CANONICAL_LOCAL_DATE_TIME_PATTERN.exec(value) : null;
  return match !== null && isCalendarDay(match[1]) && Number(match[2]) <= 23 && Number(match[3]) <= 59;
}
