import type { FoundryCurrencyFormatOptions } from '../interfaces/foundry-currency-format-options.interface';
import type { NumberWriter } from '../interfaces/number-writer.interface';
import { createNumberFormat } from './create-number-format.function';
import { writeNumber } from './write-number.function';

/**
 * Creates the number format once and returns a function that writes amounts with it, for tables and lists.
 * @throws {RangeError} When the language tag, the currency or the digits are not valid.
 * @throws {TypeError} When the options are not valid.
 */
export function createCurrencyFormatter(options: FoundryCurrencyFormatOptions): (amount: number | null | undefined) => string {
  const writer: NumberWriter = createNumberFormat(options, 'currency');
  return (amount) => writeNumber(amount, writer);
}
