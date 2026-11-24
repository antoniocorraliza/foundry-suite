import type { QUOTINGS } from '../constants/quotings.constant';

/** Cells that a CSV writes between quotes. */
export type CsvQuoting = (typeof QUOTINGS)[number];
