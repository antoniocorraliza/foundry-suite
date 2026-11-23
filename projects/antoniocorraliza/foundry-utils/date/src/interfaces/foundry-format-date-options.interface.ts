import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import type { FoundryDateSeparator } from '../types/foundry-date-separator.type';
import type { FoundryTimePrecision } from '../types/foundry-time-precision.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';

/** How `formatDate` writes a date. */
export interface FoundryFormatDateOptions {
  /** Format of the text; `'iso'` by default. */
  readonly format?: FoundryDateFormat;
  /** Separator of `'eu'` and `'us'`; `'/'` by default. */
  readonly separator?: FoundryDateSeparator;
  /** Precision of the time; `'none'` by default. */
  readonly time?: FoundryTimePrecision;
  /** Whether the date is written in local time or in UTC; `'local'` by default. */
  readonly timeZone?: FoundryTimeZoneMode;
}
