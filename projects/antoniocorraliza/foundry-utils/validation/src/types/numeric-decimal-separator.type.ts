import type { NUMERIC_DECIMAL_SEPARATORS } from '../constants/numeric-decimal-separators.constant';

/** Decimal separator that `isNumeric` reads. */
export type NumericDecimalSeparator = (typeof NUMERIC_DECIMAL_SEPARATORS)[number];
