import type { FoundryDateFormat } from '../types/foundry-date-format.type';

/** How `parseLocalDateTime` reads texts. */
export interface FoundryParseLocalDateTimeOptions {
  /** Format of the texts; `'iso'` by default. */
  readonly format?: FoundryDateFormat;
}
