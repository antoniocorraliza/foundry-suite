import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import type { FoundryDateSeparator } from '../types/foundry-date-separator.type';

/** How `formatLocalDateTime` writes a value. */
export interface FoundryFormatLocalDateTimeOptions {
  /** Format of the text; `'iso'` by default. */
  readonly format?: FoundryDateFormat;
  /** Separator of `'eu'` and `'us'`; `'/'` by default. */
  readonly separator?: FoundryDateSeparator;
}
