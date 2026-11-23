import type { CLOCK_PRECISIONS } from '../constants/clock-precisions.constant';

/** Precision of a written clock time. */
export type ClockPrecision = (typeof CLOCK_PRECISIONS)[number];
