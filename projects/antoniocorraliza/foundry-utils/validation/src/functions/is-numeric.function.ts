import { ɵreadEnumOption } from '@antoniocorraliza/foundry-utils';
import { parseDecimal } from '@antoniocorraliza/foundry-utils/number';
import { NUMERIC_DECIMAL_SEPARATORS } from '../constants/numeric-decimal-separators.constant';

/** Tells whether a value is a finite number, or a text that `parseDecimal` reads with that decimal separator and no groups. */
export function isNumeric(value: unknown, options?: { readonly decimalSeparator?: '.' | ',' }): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  const decimalSeparator: '.' | ',' = ɵreadEnumOption({
    options,
    name: 'decimalSeparator',
    allowedValues: NUMERIC_DECIMAL_SEPARATORS,
    fallback: '.',
  });
  return parseDecimal(value, { decimalSeparator }) !== null;
}
