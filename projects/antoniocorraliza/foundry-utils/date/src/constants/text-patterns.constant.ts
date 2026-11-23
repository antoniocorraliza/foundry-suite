/** Matches the `yyyy-mm-dd` date at the start of an iso text and captures its year, month and day. */
export const ISO_DATE_TEXT_PATTERN: RegExp = /^(\d{4})-(\d{2})-(\d{2})/;
/** Matches the date at the start of an eu or us text and captures its two first numbers, the separator and the year. */
export const SEPARATED_DATE_TEXT_PATTERN: RegExp = /^(\d{1,2})([./-])(\d{1,2})\2(\d{4})/;
/** Matches the time after an iso date: hours, minutes, optional seconds with 1-9 decimals and an optional time zone. */
export const ISO_TIME_TEXT_PATTERN: RegExp = /^[ Tt](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(?:([Zz])|([+-])(\d{2})(?::?(\d{2}))?)?$/;
/** Matches the time after an eu or us date: hours, minutes and optional seconds with exactly 3 decimals. */
export const SEPARATED_TIME_TEXT_PATTERN: RegExp = /^ (\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?$/;
