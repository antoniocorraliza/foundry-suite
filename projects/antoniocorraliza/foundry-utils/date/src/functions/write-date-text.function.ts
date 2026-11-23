import type { CivilDate } from '../interfaces/civil-date.interface';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import type { FoundryDateSeparator } from '../types/foundry-date-separator.type';
import { writeCivilDate } from './write-civil-date.function';

/** Returns a day as `'YYYY-MM-DD'` in iso, or with the day and the month in the order of eu or us, with a four-digit year. */
export function writeDateText(date: CivilDate, format: FoundryDateFormat, separator: FoundryDateSeparator): string {
  if (format === 'iso') return writeCivilDate(date);
  const day: string = String(date.day).padStart(2, '0');
  const month: string = String(date.month).padStart(2, '0');
  const firstParts: ReadonlyArray<string> = format === 'eu' ? [day, month] : [month, day];
  return [...firstParts, String(date.year).padStart(4, '0')].join(separator);
}
