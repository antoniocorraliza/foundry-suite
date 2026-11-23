/**
 * Returns the local days from `start` to `end`, both included, each at its first instant.
 * @throws {RangeError} When a date is invalid, `start` is after `end`, the step is not a positive integer, the list passes 36600 days or a day is skipped by the time zone.
 * @throws {TypeError} When the options are not an object.
 */
export function getDaysInRange(start: Date, end: Date, options?: { readonly stepInDays?: number }): Array<Date> {
  throw new Error('[foundry-utils]: not implemented');
}
