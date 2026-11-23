import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';

/** How `parseDate` reads texts, parts and timestamps. */
export interface FoundryParseDateOptions {
  /** Format of the texts; `'iso'` by default. */
  readonly format?: FoundryDateFormat;
  /** How a text or parts without a time zone are read; `'local'` by default. */
  readonly timeZone?: FoundryTimeZoneMode;
  /** Reads a day sent as an instant at midnight; `false` by default. */
  readonly calendarDate?: boolean;
  /** Unit of numeric timestamps; `'milliseconds'` by default. */
  readonly timestampUnit?: 'milliseconds' | 'seconds';
}
