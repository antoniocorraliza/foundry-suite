import { ɵisOptionsValue, ɵparseIntegerOption } from '@antoniocorraliza/foundry-utils';
import { MAX_YEAR, MIN_YEAR } from '../constants/date-limits.constant';

/**
 * Returns the years around a reference year, or the current local year, in ascending order.
 * @throws {RangeError} When a number is not a valid integer or a year is outside 1-9999.
 * @throws {TypeError} When the options are not an object.
 */
export function getYearRange(options: {
  readonly referenceYear?: number;
  readonly yearsBefore: number;
  readonly yearsAfter: number;
}): Array<number> {
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of getYearRange must be an object');
  const referenceYear: number = ɵparseIntegerOption({
    options,
    name: 'referenceYear',
    minimum: MIN_YEAR,
    maximum: MAX_YEAR,
    fallback: new Date().getFullYear(),
  });
  const firstYear: number = referenceYear - ɵparseIntegerOption({ options, name: 'yearsBefore', minimum: 0 });
  const lastYear: number = referenceYear + ɵparseIntegerOption({ options, name: 'yearsAfter', minimum: 0 });
  if (firstYear < MIN_YEAR || lastYear > MAX_YEAR) {
    throw new RangeError(`[foundry-utils]: the years ${firstYear} to ${lastYear} are outside ${MIN_YEAR}-${MAX_YEAR}`);
  }
  return Array.from({ length: lastYear - firstYear + 1 }, (_entry, index) => firstYear + index);
}
