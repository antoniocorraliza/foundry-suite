import type { CSV_DECIMAL_SEPARATORS } from '../constants/csv-decimal-separators.constant';

/** Decimal separator of the number cells that a CSV writes. */
export type CsvDecimalSeparator = (typeof CSV_DECIMAL_SEPARATORS)[number];
