import type { FoundryParseLocalDateTimeOptions } from '../interfaces/foundry-parse-local-date-time-options.interface';
import type { FoundryLocalDateTime } from '../types/foundry-local-date-time.type';

/**
 * Converts unvalidated data into a canonical `'YYYY-MM-DDTHH:mm'` value, or returns `null`, without looking at the time zone.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function parseLocalDateTime(value: unknown, options?: FoundryParseLocalDateTimeOptions): FoundryLocalDateTime | null {
  throw new Error('[foundry-utils]: not implemented');
}
