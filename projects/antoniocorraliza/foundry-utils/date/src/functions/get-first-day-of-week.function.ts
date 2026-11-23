import { FIRST_DAY_OF_WEEK_REGIONS } from '../constants/first-day-of-week.cldr.constant';
import { WEEKDAY_KEYWORDS } from '../constants/weekday-keywords.constant';
import type { FoundryWeekday } from '../types/foundry-weekday.type';
import { readUnicodeKeyword } from './read-unicode-keyword.function';

function createLocale(locale: string): Intl.Locale {
  try {
    return new Intl.Locale(locale);
  } catch (error: unknown) {
    throw new RangeError(`[foundry-utils]: ${JSON.stringify(locale)} is not a valid language tag`, { cause: error });
  }
}

function findRegion(locale: Intl.Locale): string | null {
  const preferenceRegion: string = readUnicodeKeyword(locale.toString(), 'rg')?.slice(0, 2).toUpperCase() ?? '';
  if (/^[A-Z]{2}$/.test(preferenceRegion)) return preferenceRegion;
  return locale.region ?? locale.maximize().region ?? null;
}

function splitRegionCodes(regions: string): Array<string> {
  const codes: Array<string> = regions.match(/[A-Z]{2}/g) ?? [];
  return codes;
}

function findWeekdayOfRegion(region: string | null): FoundryWeekday {
  const weekday: number = FIRST_DAY_OF_WEEK_REGIONS.findIndex((regions) => region !== null && splitRegionCodes(regions).includes(region));
  return (weekday === -1 ? 1 : weekday) as FoundryWeekday;
}

/**
 * Returns the first day of the week of a language tag, from a CLDR table that does not depend on the engine; Monday when the region is unknown.
 * @throws {RangeError} When the language tag is invalid.
 * @throws {TypeError} When the language tag is not a string.
 */
export function getFirstDayOfWeek(locale: string): FoundryWeekday {
  if (typeof locale !== 'string') throw new TypeError(`[foundry-utils]: the language tag must be a string, got ${typeof locale}`);
  const parsedLocale: Intl.Locale = createLocale(locale);
  const keywordWeekday: number = WEEKDAY_KEYWORDS.indexOf(readUnicodeKeyword(parsedLocale.toString(), 'fw') ?? '');
  return keywordWeekday === -1 ? findWeekdayOfRegion(findRegion(parsedLocale)) : (keywordWeekday as FoundryWeekday);
}
