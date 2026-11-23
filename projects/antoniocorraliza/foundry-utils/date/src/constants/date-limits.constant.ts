import { MILLISECONDS_PER_DAY } from './time-units.constant';

/** First year that the date functions read and write. */
export const MIN_YEAR: number = 1;
/** Last year that the date functions read and write. */
export const MAX_YEAR: number = 9999;
/** Days from 1970-01-01 to 0001-01-01. */
export const MIN_EPOCH_DAY: number = -719_162;
/** Days from 1970-01-01 to 9999-12-31. */
export const MAX_EPOCH_DAY: number = 2_932_896;
/** First millisecond of 0001-01-01 in UTC. */
export const MIN_TIME: number = MIN_EPOCH_DAY * MILLISECONDS_PER_DAY;
/** Last millisecond of 9999-12-31 in UTC. */
export const MAX_TIME: number = (MAX_EPOCH_DAY + 1) * MILLISECONDS_PER_DAY - 1;
/** Most days that a list of days returns, about a hundred years. */
export const MAX_LISTED_DAYS: number = 36_600;
/** Most weeks of `getCalendarWeek`: the whole weeks that fit in the most listed days. */
export const MAX_CALENDAR_WEEKS: number = (MAX_LISTED_DAYS - (MAX_LISTED_DAYS % 7)) / 7;
