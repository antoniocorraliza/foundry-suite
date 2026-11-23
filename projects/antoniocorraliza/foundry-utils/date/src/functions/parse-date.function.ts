import type { FoundryParseDateOptions } from '../interfaces/foundry-parse-date-options.interface';

/**
 * Converts unvalidated data into a valid `Date`, or returns `null`; it never returns an invalid date.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function parseDate(value: unknown, options?: FoundryParseDateOptions): Date | null {
  throw new Error('[foundry-utils]: not implemented');
}
