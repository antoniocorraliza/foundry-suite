import type { REPEATED_TIMES } from '../constants/repeated-times.constant';

/** Which instant of a repeated clock time is read. */
export type RepeatedTime = (typeof REPEATED_TIMES)[number];
