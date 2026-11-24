import type { FoundryNumberFormatOptions } from './foundry-number-format-options.interface';

/** How `formatCurrency` writes an amount. */
export interface FoundryCurrencyFormatOptions extends FoundryNumberFormatOptions {
  /** ISO 4217 code of the currency. */
  readonly currency: string;
}
