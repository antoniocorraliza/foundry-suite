import type { CivilDate } from '../interfaces/civil-date.interface';
import type { FoundryLocalDateTime } from '../types/foundry-local-date-time.type';
import { writeCivilDate } from './write-civil-date.function';

/** Returns a day and a clock time as canonical `'YYYY-MM-DDTHH:mm'` text. */
export function writeLocalDateTime(date: CivilDate, hours: number, minutes: number): FoundryLocalDateTime {
  return `${writeCivilDate(date)}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
