import type { TIMESTAMP_UNITS } from '../constants/timestamp-units.constant';

/** Unit of a numeric timestamp: milliseconds, as `Date` counts, or seconds, as Unix tools write it. */
export type TimestampUnit = (typeof TIMESTAMP_UNITS)[number];
