import { ɵparseLanguageTag } from '@antoniocorraliza/foundry-utils';
import { FIRST_DAY_OF_WEEK_BY_REGION } from '../constants/first-day-of-week.cldr.constant';
import { WEEKDAY_KEYWORDS } from '../constants/weekday-keywords.constant';
import type { FoundryWeekday } from '../types/foundry-weekday.type';
import { readUnicodeKeyword } from './read-unicode-keyword.function';

function findRegion(locale: Intl.Locale): string | null {
  const preferenceRegion: string = readUnicodeKeyword(locale.toString(), 'rg')?.slice(0, 2).toUpperCase() ?? '';
  if (/^[A-Z]{2}$/.test(preferenceRegion)) return preferenceRegion;
  return locale.region ?? locale.maximize().region ?? null;
}

function findWeekdayOfRegion(region: string | null): FoundryWeekday {
  if (region === null) return 1;
  return FIRST_DAY_OF_WEEK_BY_REGION[region] ?? 1;
}

/**
 * Returns the first day of the week of a language tag, from a CLDR table that does not depend on the engine; Monday when the region is unknown.
 * @throws {RangeError} When the language tag is invalid.
 * @throws {TypeError} When the language tag is not a string.
 */
export function getFirstDayOfWeek(locale: string): FoundryWeekday {
  const parsedLocale: Intl.Locale = new Intl.Locale(ɵparseLanguageTag(locale));
  const keywordWeekday: number = WEEKDAY_KEYWORDS.indexOf(readUnicodeKeyword(parsedLocale.toString(), 'fw') ?? '');
  return keywordWeekday === -1 ? findWeekdayOfRegion(findRegion(parsedLocale)) : (keywordWeekday as FoundryWeekday);
}
