import type { CivilDate } from '../interfaces/civil-date.interface';
import type { FoundryCalendarDay } from '../types/foundry-calendar-day.type';

/** Returns a day as canonical `'YYYY-MM-DD'` text, with four digits in the year. */
export function writeCivilDate(date: CivilDate): FoundryCalendarDay {
  return `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}
