import { ɵisOptionsValue } from '@antoniocorraliza/foundry-utils';
import { MAX_YEAR, MIN_YEAR } from '../constants/date-limits.constant';

function readNonNegativeInteger(options: Readonly<Record<string, unknown>> | undefined, name: string): number | null {
  const value: unknown = options?.[name];
  return Number.isInteger(value) && (value as number) >= 0 ? (value as number) : null;
}

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
  const referenceYear: unknown = options?.['referenceYear'] === undefined ? new Date().getFullYear() : options['referenceYear'];
  const yearsBefore: number | null = readNonNegativeInteger(options, 'yearsBefore');
  const yearsAfter: number | null = readNonNegativeInteger(options, 'yearsAfter');
  if (!Number.isInteger(referenceYear) || yearsBefore === null || yearsAfter === null) {
    throw new RangeError('[foundry-utils]: referenceYear must be an integer, and yearsBefore and yearsAfter integers from 0');
  }
  const firstYear: number = (referenceYear as number) - yearsBefore;
  const lastYear: number = (referenceYear as number) + yearsAfter;
  if (firstYear < MIN_YEAR || lastYear > MAX_YEAR) {
    throw new RangeError(`[foundry-utils]: the years ${firstYear} to ${lastYear} are outside 1-9999`);
  }
  return Array.from({ length: lastYear - firstYear + 1 }, (_entry, index) => firstYear + index);
}
