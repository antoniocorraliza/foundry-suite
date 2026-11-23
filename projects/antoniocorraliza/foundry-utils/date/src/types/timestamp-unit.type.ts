import type { TIMESTAMP_UNITS } from '../constants/timestamp-units.constant';

/** Unit of a numeric timestamp. */
export type TimestampUnit = (typeof TIMESTAMP_UNITS)[number];
