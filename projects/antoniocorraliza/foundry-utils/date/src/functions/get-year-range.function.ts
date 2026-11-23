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
  throw new Error('[foundry-utils]: not implemented');
}
