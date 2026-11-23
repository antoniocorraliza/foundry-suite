import type { FoundryWeekday } from '../types/foundry-weekday.type';

/**
 * Returns the first day of the week of a locale from the CLDR table of the package, Monday when the region is unknown.
 * @throws {RangeError} When the locale is not a valid BCP 47 tag.
 * @throws {TypeError} When the locale is not a string.
 */
export function getFirstDayOfWeek(locale: string): FoundryWeekday {
  throw new Error('[foundry-utils]: not implemented');
}
