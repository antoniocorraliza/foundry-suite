import type { FoundryWeekday } from '../types/foundry-weekday.type';

/** Returns the weekday of a day counted from 1970-01-01, which was a Thursday. */
export function getWeekdayOfEpochDay(epochDay: number): FoundryWeekday {
  return ((((epochDay + 4) % 7) + 7) % 7) as FoundryWeekday;
}
