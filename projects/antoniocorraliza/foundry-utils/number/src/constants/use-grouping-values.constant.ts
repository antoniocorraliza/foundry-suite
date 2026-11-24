import type { FoundryNumberFormatOptions } from '../interfaces/foundry-number-format-options.interface';
import type { UseGrouping } from '../types/use-grouping.type';

/** Value of the `useGrouping` option of `Intl.NumberFormat` for each value of the `grouping` option. */
export const USE_GROUPING_VALUES: Readonly<Record<NonNullable<FoundryNumberFormatOptions['grouping']>, UseGrouping>> = {
  locale: 'auto',
  always: 'always',
  never: false,
};
