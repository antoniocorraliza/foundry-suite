/** Pattern of a `'YYYY-MM-DD'` text, which captures its year, month and day. */
export const CANONICAL_DAY_PATTERN: RegExp = /^(\d{4})-(\d{2})-(\d{2})$/;
/** Pattern of a `'YYYY-MM-DDTHH:mm'` text, which captures its year, month, day, hours and minutes. */
export const CANONICAL_LOCAL_DATE_TIME_PATTERN: RegExp = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
