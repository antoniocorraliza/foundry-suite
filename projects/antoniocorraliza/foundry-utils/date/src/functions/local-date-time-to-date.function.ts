import type { FoundryLocalDateTimeToDateOptions } from '../interfaces/foundry-local-date-time-to-date-options.interface';
import type { FoundryLocalDateTime } from '../types/foundry-local-date-time.type';

/**
 * Returns the instant of a clock time, or `null` when the time zone skips that time.
 * @throws {RangeError} When the value is not canonical.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function localDateTimeToDate(value: FoundryLocalDateTime, options?: FoundryLocalDateTimeToDateOptions): Date | null {
  throw new Error('[foundry-utils]: not implemented');
}
