import { ɵcheckOptions, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { DECIMAL_SEPARATORS } from '../constants/decimal-separators.constant';
import { GROUP_SEPARATORS } from '../constants/group-separators.constant';
import { GROUP_STYLES } from '../constants/group-styles.constant';
import type { FoundryParseDecimalOptions } from '../interfaces/foundry-parse-decimal-options.interface';
import { readDecimal } from './read-decimal.function';

/**
 * Reads a decimal number written with the given separators, or returns `null` when the value is not such a number.
 * @throws {RangeError} When the group separator is the decimal separator.
 * @throws {TypeError} When the options are not valid.
 */
export function parseDecimal(value: unknown, options: FoundryParseDecimalOptions): number | null {
  ɵcheckOptions(options, 'parseDecimal');
  const format: Required<FoundryParseDecimalOptions> = {
    decimalSeparator: ɵparseEnumOption({ options, name: 'decimalSeparator', allowedValues: DECIMAL_SEPARATORS }),
    groupSeparator: ɵparseEnumOption({ options, name: 'groupSeparator', allowedValues: GROUP_SEPARATORS, fallback: null }),
    groupStyle: ɵparseEnumOption({ options, name: 'groupStyle', allowedValues: GROUP_STYLES, fallback: 'thousands' }),
  };
  if (format.groupSeparator === format.decimalSeparator) {
    throw new RangeError(`[foundry-utils]: the group separator ${format.groupSeparator} is also the decimal separator`);
  }
  return readDecimal(value, format);
}
