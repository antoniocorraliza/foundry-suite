import type { FoundryFormatLocalDateTimeOptions } from '../interfaces/foundry-format-local-date-time-options.interface';
import type { FoundryLocalDateTime } from '../types/foundry-local-date-time.type';

/**
 * Writes a local date and time in the requested format, or returns `null` for `null`.
 * @throws {RangeError} When the value is not canonical.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function formatLocalDateTime(value: FoundryLocalDateTime, options?: FoundryFormatLocalDateTimeOptions): string;

/**
 * Writes a local date and time in the requested format, or returns `null` for `null`.
 * @throws {RangeError} When the value is not canonical.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function formatLocalDateTime(value: FoundryLocalDateTime | null, options?: FoundryFormatLocalDateTimeOptions): string | null;

export function formatLocalDateTime(value: FoundryLocalDateTime | null, options?: FoundryFormatLocalDateTimeOptions): string | null {
  throw new Error('[foundry-utils]: not implemented');
}
