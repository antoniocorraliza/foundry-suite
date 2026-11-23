import { ISO_DATE_TEXT_PATTERN, SEPARATED_DATE_TEXT_PATTERN } from '../constants/text-patterns.constant';
import type { CivilDate } from '../interfaces/civil-date.interface';
import type { DateTextReading } from '../interfaces/date-text-reading.interface';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import { isExistingCivilDate } from './is-existing-civil-date.function';

/** Reads the day at the start of a text in a format, after trimming its spaces, or returns `null` when it is not a day that exists. */
export function readDateText(text: string, format: FoundryDateFormat): DateTextReading | null {
  const trimmedText: string = text.trim();
  const match: RegExpExecArray | null = (format === 'iso' ? ISO_DATE_TEXT_PATTERN : SEPARATED_DATE_TEXT_PATTERN).exec(trimmedText);
  if (match === null) return null;
  const [first = 0, second = 0, third = 0] = (format === 'iso' ? [match[1], match[2], match[3]] : [match[1], match[3], match[4]]).map(
    Number,
  );
  const date: CivilDate =
    format === 'iso'
      ? { year: first, month: second, day: third }
      : { year: third, month: format === 'eu' ? second : first, day: format === 'eu' ? first : second };
  return isExistingCivilDate(date) ? { date, rest: trimmedText.slice(match[0].length) } : null;
}
