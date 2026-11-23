import type { FoundryFormatDateOptions } from '../interfaces/foundry-format-date-options.interface';

/**
 * Writes a date as text, or returns `null` for `null`.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function formatDate(date: Date, options?: FoundryFormatDateOptions): string;

/**
 * Writes a date as text, or returns `null` for `null`.
 * @throws {RangeError} When the date is invalid or its year is outside 1-9999.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function formatDate(date: Date | null, options?: FoundryFormatDateOptions): string | null;

export function formatDate(date: Date | null, options?: FoundryFormatDateOptions): string | null {
  throw new Error('[foundry-utils]: not implemented');
}
