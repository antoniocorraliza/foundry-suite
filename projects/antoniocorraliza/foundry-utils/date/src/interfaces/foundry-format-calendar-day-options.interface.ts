import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import type { FoundryDateSeparator } from '../types/foundry-date-separator.type';

/** How `formatCalendarDay` writes a day. */
export interface FoundryFormatCalendarDayOptions {
  /** Format of the text; `'iso'` by default. */
  readonly format?: FoundryDateFormat;
  /** Separator of `'eu'` and `'us'`; `'/'` by default. */
  readonly separator?: FoundryDateSeparator;
}
