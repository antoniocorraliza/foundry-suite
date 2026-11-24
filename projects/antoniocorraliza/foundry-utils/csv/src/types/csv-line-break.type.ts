import type { LINE_BREAKS } from '../constants/line-breaks.constant';

/** End of every line that a CSV writes. */
export type CsvLineBreak = (typeof LINE_BREAKS)[number];
