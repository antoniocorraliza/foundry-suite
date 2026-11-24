import type { NumberFormatStyle } from '../types/number-format-style.type';
import type { UseGrouping } from '../types/use-grouping.type';

/** Options of the `Intl.NumberFormat` of the formatting functions, with the values that the standard library of the code does not type. */
export interface NumberFormatSettings {
  readonly style: NumberFormatStyle;
  readonly currency?: string;
  readonly minimumFractionDigits?: number;
  readonly maximumFractionDigits?: number;
  readonly useGrouping: UseGrouping;
  readonly signDisplay: 'negative';
}
