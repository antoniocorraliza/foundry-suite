/** Pattern of the `yyyy-mm-dd` date at the start of an iso text, which captures its year, month and day. */
export const ISO_DATE_TEXT_PATTERN: RegExp = /^(\d{4})-(\d{2})-(\d{2})/;
/** Pattern of the date at the start of an eu or us text, which captures its two first numbers, the separator and the year. */
export const SEPARATED_DATE_TEXT_PATTERN: RegExp = /^(\d{1,2})([./-])(\d{1,2})\2(\d{4})/;
/** Pattern of the time after an iso date: hours, minutes, optional seconds with 1-9 decimals and an optional time zone. */
export const ISO_TIME_TEXT_PATTERN: RegExp =
  /^[ Tt](?<hours>\d{2}):(?<minutes>\d{2})(?::(?<seconds>\d{2})(?:\.(?<fraction>\d{1,9}))?)?(?:(?<utc>[Zz])|(?<sign>[+-])(?<offsetHours>\d{2})(?::?(?<offsetMinutes>\d{2}))?)?$/;
/** Pattern of the time after an eu or us date: hours, minutes and optional seconds with exactly 3 decimals. */
export const SEPARATED_TIME_TEXT_PATTERN: RegExp = /^ (?<hours>\d{2}):(?<minutes>\d{2})(?::(?<seconds>\d{2})(?:\.(?<fraction>\d{3}))?)?$/;
