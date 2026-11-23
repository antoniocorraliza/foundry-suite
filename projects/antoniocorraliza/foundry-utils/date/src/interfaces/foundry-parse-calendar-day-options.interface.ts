import type { FoundryDateFormat } from '../types/foundry-date-format.type';

/** How `parseCalendarDay` reads texts and midnight instants. */
export interface FoundryParseCalendarDayOptions {
  /** Format of the texts; `'iso'` by default. */
  readonly format?: FoundryDateFormat;
  /** Also reads a day sent as an instant at midnight; `false` by default. */
  readonly acceptMidnightInstant?: boolean;
  /** Unit of numeric timestamps, only with `acceptMidnightInstant`; `'milliseconds'` by default. */
  readonly timestampUnit?: 'milliseconds' | 'seconds';
}
